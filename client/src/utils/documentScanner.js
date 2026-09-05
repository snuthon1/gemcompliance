import { createWorker } from 'tesseract.js';

/**
 * Scans an uploaded file (image, text, PDF) and extracts real statutory credentials.
 * Matches extracted credentials against the bidder's registered profile.
 *
 * @param {File} file - Uploaded File object
 * @param {string} docType - 'PAN_CARD' | 'GST_CERT' | 'UDYAM_CERT' | 'ITR_V' | 'AUDIT_REPORT'
 * @param {object} bidder - Registered bidder profile
 * @param {function} [onProgress] - Optional progress callback
 * @returns {Promise<{ extracted: object, flagged: boolean, flag_reason: string|null }>}
 */
export async function scanAndVerifyDocument(file, docType, bidder, onProgress) {
  let rawText = '';
  const fileName = file.name || '';
  const fileType = file.type || '';
  const isImage = fileType.startsWith('image/') || /\.(png|jpe?g|webp|bmp|gif)$/i.test(fileName);
  const isText = fileType.startsWith('text/') || /\.(txt|json|csv|log)$/i.test(fileName);
  const isPdf = fileType === 'application/pdf' || /\.pdf$/i.test(fileName);

  try {
    if (isText) {
      if (onProgress) onProgress(30, 'Reading text file contents...');
      rawText = await file.text();
      if (onProgress) onProgress(100, 'Text extracted successfully.');
    } else if (isImage) {
      if (onProgress) onProgress(15, 'Initializing Optical Character Recognition (OCR)...');
      
      const worker = await createWorker('eng');
      
      if (onProgress) onProgress(45, 'Scanning document image for text...');
      const ret = await worker.recognize(file);
      rawText = ret.data.text || '';
      await worker.terminate();
      
      if (onProgress) onProgress(90, 'OCR scanning complete. Parsing statutory patterns...');
    } else if (isPdf) {
      // PDF files contain binary-encoded streams. Browser-side text extraction
      // from raw PDF bytes yields gibberish. We extract printable ASCII fragments,
      // but if the content is purely binary, we defer to server-side analysis
      // rather than falsely flagging the document.
      if (onProgress) onProgress(30, 'Analyzing PDF document structure...');
      try {
        const arrayBuf = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuf);
        let asciiText = '';
        for (let i = 0; i < Math.min(bytes.length, 50000); i++) {
          const b = bytes[i];
          if ((b >= 32 && b <= 126) || b === 10 || b === 13) {
            asciiText += String.fromCharCode(b);
          } else {
            asciiText += ' ';
          }
        }
        rawText = asciiText;
      } catch (e) {
        rawText = '';
      }
      if (onProgress) onProgress(90, 'PDF text layer extraction complete.');
    } else {
      try {
        const slice = await file.slice(0, 4000).text();
        rawText = slice;
      } catch (e) {
        rawText = '';
      }
    }
  } catch (err) {
    console.warn('[DOC_SCANNER] OCR / text extraction encountered error:', err);
    rawText = '';
  }

  // Parse extracted raw text
  const cleanText = rawText.replace(/\s+/g, ' ').trim();
  const upperText = cleanText.toUpperCase();

  // Detect if this is raw PDF binary content with no extractable text
  const isPdfBinary = upperText.startsWith('%PDF') || (isPdf && cleanText.length < 20);

  // Statutory Regexes
  const panRegex = /\b([A-Z]{5}[0-9]{4}[A-Z])\b/g;
  const gstinRegex = /\b([0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z])\b/g;
  const udyamRegex = /\b(UDYAM\s*[-/]\s*[A-Z]{2}\s*[-/]\s*[0-9]{2}\s*[-/]\s*[0-9]{7})\b/i;

  const detectedPans = [...upperText.matchAll(panRegex)].map(m => m[1]);
  const detectedGstins = [...upperText.matchAll(gstinRegex)].map(m => m[1]);
  const udyamMatch = upperText.match(udyamRegex);
  const detectedUdyam = udyamMatch ? udyamMatch[1].replace(/\s+/g, '').replace(/\//g, '-') : null;

  // Check if any meaningful text was found at all
  const hasReadableText = cleanText.length >= 10 && !isPdfBinary;

  let flagged = false;
  let flagReason = null;
  let docTitle = 'Statutory Document';
  let identifiedNumber = null;

  if (docType === 'PAN_CARD') {
    docTitle = 'Permanent Account Number Card';
    if (isPdfBinary && detectedPans.length === 0) {
      // PDF binary without extractable PAN — don't flag, defer to server
      flagged = false;
      flagReason = null;
      identifiedNumber = null;
    } else if (detectedPans.length === 0) {
      flagged = true;
      flagReason = hasReadableText
        ? 'No valid 10-digit PAN pattern detected in uploaded document'
        : 'Unreadable or non-statutory document: No readable text or PAN credentials detected in file';
    } else {
      const bidderPan = (bidder?.pan_number || '').toUpperCase();
      const matched = detectedPans.find(p => p === bidderPan);
      identifiedNumber = matched || detectedPans[0];

      if (bidderPan && !matched) {
        flagged = true;
        flagReason = `PAN mismatch: Extracted PAN (${identifiedNumber}) does not match registered bidder PAN (${bidderPan})`;
      }
    }
  } else if (docType === 'GST_CERT') {
    docTitle = 'GST Registration Certificate (Form GST REG-06)';
    if (isPdfBinary && detectedGstins.length === 0) {
      flagged = false;
      flagReason = null;
      identifiedNumber = null;
    } else if (detectedGstins.length === 0) {
      flagged = true;
      flagReason = hasReadableText
        ? 'No valid 15-character GSTIN pattern detected in uploaded document'
        : 'Unreadable or non-statutory document: No readable GSTIN credentials detected in file';
    } else {
      const bidderGstin = (bidder?.gstin || '').toUpperCase();
      const matched = detectedGstins.find(g => g === bidderGstin);
      identifiedNumber = matched || detectedGstins[0];

      if (bidderGstin && !matched) {
        flagged = true;
        flagReason = `GSTIN mismatch: Extracted GSTIN (${identifiedNumber}) does not match registered bidder GSTIN (${bidderGstin})`;
      }
    }
  } else if (docType === 'UDYAM_CERT') {
    docTitle = 'Udyam MSME Registration Certificate';
    if (isPdfBinary && !detectedUdyam) {
      flagged = false;
      flagReason = null;
      identifiedNumber = null;
    } else if (!detectedUdyam) {
      flagged = true;
      flagReason = hasReadableText
        ? 'No valid Udyam registration number detected in uploaded document'
        : 'Unreadable or non-statutory document: No MSME Udyam credentials detected in file';
    } else {
      const bidderUdyam = (bidder?.udyam_number || '').toUpperCase();
      identifiedNumber = detectedUdyam;
      if (bidderUdyam && detectedUdyam !== bidderUdyam) {
        flagged = true;
        flagReason = `Udyam mismatch: Extracted (${detectedUdyam}) does not match registered bidder (${bidderUdyam})`;
      }
    }
  } else if (docType === 'ITR_V') {
    docTitle = 'ITR-V Income Tax Return Verification';
    const itrKeywords = ['INCOME TAX', 'ITR', 'ASSESSMENT YEAR', 'RETURN', 'DEPARTMENT', 'VERIFICATION', 'PAN', 'AY 20'];
    const matchedKeywords = itrKeywords.filter(kw => upperText.includes(kw));
    if (isPdfBinary) {
      flagged = false;
      flagReason = null;
    } else if (!hasReadableText) {
      flagged = true;
      flagReason = 'Unreadable document: No readable text detected in uploaded ITR-V file';
    } else if (matchedKeywords.length < 2) {
      flagged = true;
      flagReason = `Document does not appear to be a valid ITR-V: Expected tax-related content (${matchedKeywords.length}/2 minimum keywords matched)`;
    }
    if (!flagged && detectedPans.length > 0) {
      const bidderPan = (bidder?.pan_number || '').toUpperCase();
      identifiedNumber = detectedPans[0];
      if (bidderPan && !detectedPans.includes(bidderPan)) {
        flagged = true;
        flagReason = `ITR-V PAN mismatch: Document PAN (${identifiedNumber}) does not match registered bidder PAN (${bidderPan})`;
      }
    }
  } else if (docType === 'AUDIT_REPORT') {
    docTitle = 'Audited Balance Sheet / Financial Statement';
    const auditKeywords = ['BALANCE SHEET', 'AUDIT', 'FINANCIAL', 'STATEMENT', 'PROFIT', 'LOSS', 'ASSETS', 'LIABILITIES', 'CHARTERED ACCOUNTANT', 'CA '];
    const matchedKeywords = auditKeywords.filter(kw => upperText.includes(kw));
    if (isPdfBinary) {
      flagged = false;
      flagReason = null;
    } else if (!hasReadableText) {
      flagged = true;
      flagReason = 'Unreadable document: No readable text detected in uploaded audit report file';
    } else if (matchedKeywords.length < 2) {
      flagged = true;
      flagReason = `Document does not appear to be a valid Audit Report: Expected financial/audit content (${matchedKeywords.length}/2 minimum keywords matched)`;
    }
  }

  const extracted = {
    document_type: docTitle,
    file_name: fileName,
    has_readable_text: hasReadableText,
    identified_number: identifiedNumber,
    raw_snippet: cleanText.substring(0, 160),
    ocr_completed: true,
    pdf_binary_detected: isPdfBinary || false
  };

  return {
    extracted,
    flagged,
    flag_reason: flagReason
  };
}
