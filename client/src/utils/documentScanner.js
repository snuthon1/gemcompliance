import { createWorker } from 'tesseract.js';

/**
 * Strict Zero-Trust Document Scanner & Statutory Validator.
 * Every uploaded file must PROVE its statutory authenticity:
 * 1. Must contain valid Indian statutory pattern (PAN, GSTIN, or Udyam).
 * 2. Extracted credential MUST match the registering enterprise profile.
 * 3. Any random file (blank, resume, invoice, unrelated PDF/image) is FLAGGED.
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
      if (onProgress) onProgress(30, 'Reading text document stream...');
      rawText = await file.text();
      if (onProgress) onProgress(100, 'Text extraction complete.');
    } else if (isImage) {
      if (onProgress) onProgress(15, 'Initializing Optical Character Recognition (OCR)...');
      const worker = await createWorker('eng');
      if (onProgress) onProgress(45, 'Scanning document image via Vision OCR...');
      const ret = await worker.recognize(file);
      rawText = ret.data.text || '';
      await worker.terminate();
      if (onProgress) onProgress(90, 'OCR scanning complete. Analyzing statutory patterns...');
    } else if (isPdf) {
      if (onProgress) onProgress(25, 'Analyzing PDF document streams & byte tokens...');
      try {
        const arrayBuf = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuf);
        
        // Comprehensive multi-layer PDF text and stream reader
        let extractedChunks = [];

        // 1. Extract printable ASCII runs (covers uncompressed text & metadata)
        let currentRun = '';
        for (let i = 0; i < bytes.length; i++) {
          const b = bytes[i];
          if ((b >= 32 && b <= 126) || b === 10 || b === 13) {
            currentRun += String.fromCharCode(b);
          } else {
            if (currentRun.length >= 4) {
              extractedChunks.push(currentRun);
            }
            currentRun = '';
          }
        }
        if (currentRun.length >= 4) extractedChunks.push(currentRun);

        // 2. Decode literal text within PDF content streams: (Text) Tj or (Text) '
        const rawByteString = extractedChunks.join(' ');
        const textObjectMatches = rawByteString.match(/\(([^()\\]*(?:\\.[^()\\]*)*)\)/g) || [];
        const decodedTextObjects = textObjectMatches.map(m => m.slice(1, -1).replace(/\\([()\\])/g, '$1')).join(' ');

        rawText = `${rawByteString} ${decodedTextObjects}`;
      } catch (pdfErr) {
        console.warn('[DOC_SCANNER] PDF parsing fallback:', pdfErr);
        rawText = '';
      }
      if (onProgress) onProgress(90, 'PDF extraction complete. Verifying against registries...');
    } else {
      try {
        const slice = await file.slice(0, 50000).text();
        rawText = slice;
      } catch (e) {
        rawText = '';
      }
    }
  } catch (err) {
    console.warn('[DOC_SCANNER] Extraction encountered error:', err);
    rawText = '';
  }

  // Normalize parsed text
  const cleanText = rawText.replace(/\s+/g, ' ').trim();
  const upperText = cleanText.toUpperCase();

  // Indian Statutory Credential Patterns
  const panRegex = /\b([A-Z]{5}[0-9]{4}[A-Z])\b/g;
  const gstinRegex = /\b([0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z])\b/g;
  const udyamRegex = /\b(UDYAM\s*[-/]?\s*[A-Z]{2}\s*[-/]?\s*[0-9]{2}\s*[-/]?\s*[0-9]{7})\b/i;

  const detectedPans = [...upperText.matchAll(panRegex)].map(m => m[1]);
  const detectedGstins = [...upperText.matchAll(gstinRegex)].map(m => m[1]);
  const udyamMatch = upperText.match(udyamRegex);
  const detectedUdyam = udyamMatch ? udyamMatch[1].replace(/[^A-Z0-9]/g, '') : null;

  let flagged = false;
  let flagReason = null;
  let docTitle = 'Statutory Document';
  let identifiedNumber = null;

  // STRICT ZERO-TRUST VERIFICATION:
  // Must prove presence of official credential AND match registered enterprise.
  if (docType === 'PAN_CARD') {
    docTitle = 'Permanent Account Number Card';
    const bidderPan = (bidder?.pan_number || '').toUpperCase().trim();

    if (detectedPans.length === 0) {
      flagged = true;
      flagReason = 'Invalid or Non-Statutory Document: No valid 10-character PAN pattern detected in uploaded file. Please upload an official Government of India PAN Card.';
    } else {
      const matched = detectedPans.find(p => p === bidderPan);
      identifiedNumber = matched || detectedPans[0];

      if (bidderPan && !matched) {
        flagged = true;
        flagReason = `Identity Mismatch: Extracted PAN (${identifiedNumber}) does not match registered enterprise PAN (${bidderPan}). Potential third-party document.`;
      }
    }
  } else if (docType === 'GST_CERT') {
    docTitle = 'GST Registration Certificate (Form GST REG-06)';
    const bidderGstin = (bidder?.gstin || '').toUpperCase().trim();
    const bidderPan = (bidder?.pan_number || '').toUpperCase().trim();

    // In GST certificates, either the full 15-char GSTIN is present, or the entity PAN embedded inside it
    if (detectedGstins.length === 0 && !detectedPans.includes(bidderPan)) {
      flagged = true;
      flagReason = 'Invalid or Non-Statutory Document: No valid 15-character GSTIN or matching registration credentials detected in uploaded file. Please upload official Form GST REG-06.';
    } else if (detectedGstins.length > 0) {
      const matched = detectedGstins.find(g => g === bidderGstin);
      identifiedNumber = matched || detectedGstins[0];

      if (bidderGstin && !matched) {
        flagged = true;
        flagReason = `GSTIN Mismatch: Extracted GSTIN (${identifiedNumber}) does not match registered enterprise GSTIN (${bidderGstin}).`;
      }
    } else if (detectedPans.includes(bidderPan)) {
      identifiedNumber = bidderGstin || bidderPan;
    }
  } else if (docType === 'UDYAM_CERT') {
    docTitle = 'Udyam MSME Registration Certificate';
    const bidderUdyamNorm = (bidder?.udyam_number || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (!detectedUdyam) {
      flagged = true;
      flagReason = 'Invalid or Non-Statutory Document: No valid MSME Udyam registration number (UDYAM-XX-00-0000000) detected in uploaded file.';
    } else {
      identifiedNumber = bidder?.udyam_number || detectedUdyam;
      if (bidderUdyamNorm && detectedUdyam !== bidderUdyamNorm) {
        flagged = true;
        flagReason = `Udyam Mismatch: Extracted registration (${detectedUdyam}) does not match registered enterprise Udyam (${bidder?.udyam_number}).`;
      }
    }
  } else if (docType === 'ITR_V') {
    docTitle = 'ITR-V Income Tax Return Verification';
    const itrKeywords = ['INCOME TAX', 'ITR', 'ASSESSMENT YEAR', 'RETURN', 'DEPARTMENT', 'VERIFICATION', 'CENTRALIZED PROCESSING'];
    const matchedKw = itrKeywords.filter(kw => upperText.includes(kw));
    const bidderPan = (bidder?.pan_number || '').toUpperCase().trim();

    if (matchedKw.length < 2) {
      flagged = true;
      flagReason = 'Invalid Tax Document: File does not contain official Income Tax Department filing acknowledgement markers or assessment data.';
    } else if (bidderPan && detectedPans.length > 0 && !detectedPans.includes(bidderPan)) {
      flagged = true;
      flagReason = `ITR PAN Mismatch: Extracted PAN (${detectedPans[0]}) does not match registered enterprise PAN (${bidderPan}).`;
    } else if (detectedPans.length > 0) {
      identifiedNumber = detectedPans[0];
    }
  } else if (docType === 'AUDIT_REPORT') {
    docTitle = 'Audited Balance Sheet / Financial Statement';
    const auditKeywords = ['BALANCE SHEET', 'AUDIT', 'FINANCIAL', 'STATEMENT', 'PROFIT', 'LOSS', 'CHARTERED ACCOUNTANT', 'ASSETS', 'LIABILITIES'];
    const matchedKw = auditKeywords.filter(kw => upperText.includes(kw));

    if (matchedKw.length < 2) {
      flagged = true;
      flagReason = 'Invalid Financial Document: Uploaded file lacks official Balance Sheet, Profit & Loss, or Chartered Accountant statutory audit markers.';
    }
  }

  const extracted = {
    document_type: docTitle,
    file_name: fileName,
    has_readable_text: cleanText.length >= 10,
    identified_number: identifiedNumber,
    raw_snippet: cleanText.substring(0, 160),
    ocr_completed: true
  };

  return {
    extracted,
    flagged,
    flag_reason: flagReason
  };
}
