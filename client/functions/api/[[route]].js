// Cloudflare Pages Function: BidShield Edge API (SIH26100)
// Connects directly to Turso Cloud Database (libSQL) in aws-ap-south-1

const TURSO_URL = 'https://gem-compliance-snuthon1.aws-ap-south-1.turso.io/v2/pipeline';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODg1ODMzMDEsImlkIjoiMDFhMDZmZGYtM2EwMS03YTlhLWJiMTEtM2Q2ODUzYWYyN2FmIiwia2lkIjoiMlAwTW1RdEJGR1lkaW12T3Z5MmZDSXFsXzJQd2pHdlhadDlHTGR0VkhyUSIsInJpZCI6ImMwZmJiNjI4LThiOWItNGIwYi1iMTI4LTAzZjg3ZWViYzU5ZSJ9.WTxUfsWx46akNAwVpYAOrkZDVcZ_8thIRy0BnpYtAgOLrsH8gSrDnGgGdIbVpYkggH_6x4GzLsLWoO1T5IOOBA';

async function executeSql(sql, args = []) {
  const formattedArgs = args.map(arg => {
    if (arg === null || arg === undefined) return { type: 'null' };
    if (typeof arg === 'number') return { type: Number.isInteger(arg) ? 'integer' : 'float', value: String(arg) };
    return { type: 'text', value: String(arg) };
  });

  const res = await fetch(TURSO_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TURSO_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql, args: formattedArgs } },
        { type: 'close' }
      ]
    })
  });

  const data = await res.json();
  if (data.results && data.results[0] && data.results[0].type === 'ok') {
    const result = data.results[0].response.result;
    const cols = result.cols.map(c => c.name);
    const rows = result.rows.map(row => {
      const obj = {};
      row.forEach((val, idx) => {
        obj[cols[idx]] = val.value !== undefined ? val.value : null;
      });
      return obj;
    });
    return { rows, affected: result.affected_row_count };
  }
  const msg = (data.results && data.results[0] && (data.results[0].error?.message || (data.results[0].response && data.results[0].response.message))) || 'Database query failed';
  throw new Error(msg);
}

const CHECK_WEIGHTS = {
  UDYAM_STATUS: 15,
  GST_STATUS: 15,
  GST_RETURNS: 15,
  PAN_COMPLIANCE: 10,
  BLACKLIST_CHECK: 20,
  NAME_MATCH: 15
};

function calculateScore(verificationResults, documents = []) {
  const flags = [];
  let failedWeightsSum = 0;
  let isBlacklisted = false;
  let isNameMismatch = false;

  // 1. Process 6-point statutory checks from central registries
  for (const check of verificationResults) {
    if (check.match_status === 'Mismatch') {
      const weight = CHECK_WEIGHTS[check.check_type] || 0;
      failedWeightsSum += weight;

      if (check.check_type === 'BLACKLIST_CHECK') isBlacklisted = true;
      if (check.check_type === 'NAME_MATCH') isNameMismatch = true;

      switch (check.check_type) {
        case 'BLACKLIST_CHECK':
          flags.push('Bidder is currently blacklisted/debarred — see audit trail for order details');
          break;
        case 'GST_RETURNS':
          flags.push('GST returns pending — bidder has not filed required returns');
          break;
        case 'NAME_MATCH':
          flags.push('Document name does not match GST portal records — possible identity mismatch');
          break;
        case 'UDYAM_STATUS':
          flags.push('Udyam registration is inactive or cancelled on MSME databank');
          break;
        case 'GST_STATUS':
          flags.push('GST registration is not in Active status on GSTN portal');
          break;
        case 'PAN_COMPLIANCE':
          flags.push('PAN compliance issue — Income Tax Return (ITR) was not filed for the previous assessment year');
          break;
        default:
          flags.push(`Check ${check.check_type} failed verification`);
      }
    }
  }

  // 2. Process uploaded statutory documents discrepancies from the vault
  const flaggedDocs = (documents || []).filter(
    d => d && (d.flagged === 1 || d.flagged === '1' || d.flagged === true || (d.flag_reason && d.flag_reason.trim().length > 0))
  );

  for (const doc of flaggedDocs) {
    const reason = doc.flag_reason || `Discrepancy detected in uploaded ${doc.doc_type || 'statutory'} certificate`;
    flags.push(`Statutory Document Discrepancy (${doc.doc_type || 'Document'}): ${reason}`);
    failedWeightsSum += 25; // Significant penalty per flagged document
  }

  // Hard Override: If Blacklisted -> Score 0, High Risk, Non-Compliant
  if (isBlacklisted) {
    return { score: 0, risk: 'High', recommendation: 'Non-Compliant', flags, flaggedDocuments: flaggedDocs };
  }

  let score = Math.max(0, 100 - failedWeightsSum);

  // If ANY document is flagged, score cannot exceed 75 and risk CANNOT be Low!
  if (flaggedDocs.length > 0) {
    score = Math.min(score, 75);
  }

  let risk = 'Low';
  let recommendation = 'Compliant';

  if (score >= 85) {
    risk = 'Low';
    recommendation = 'Compliant';
  } else if (score >= 60) {
    risk = 'Medium';
    recommendation = 'Needs Clarification';
  } else {
    risk = 'High';
    recommendation = 'Non-Compliant';
  }

  // Rule A: If NAME_MATCH mismatch, risk must be at least Medium
  if (isNameMismatch && risk === 'Low') {
    risk = 'Medium';
    recommendation = 'Needs Clarification';
  }

  // Rule B: If ANY document has a discrepancy, risk CANNOT be Low
  if (flaggedDocs.length > 0 && risk === 'Low') {
    risk = 'Medium';
    recommendation = 'Needs Clarification';
  }

  // Rule C: If 2 or more documents are flagged, escalate to High Risk
  if (flaggedDocs.length >= 2) {
    risk = 'High';
    recommendation = 'Non-Compliant';
    score = Math.min(score, 50);
  }

  return { score, risk, recommendation, flags, flaggedDocuments: flaggedDocs };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const method = request.method;
  const path = url.pathname;

  if (method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  try {
    // 1. Health check
    if (path === '/api/health') {
      const bRes = await executeSql('SELECT COUNT(*) as c FROM Bidder');
      const tRes = await executeSql('SELECT COUNT(*) as c FROM Tender');
      const biRes = await executeSql('SELECT COUNT(*) as c FROM Bid');
      return jsonResponse({
        status: 'healthy',
        service: 'BidShield - GeM Bid Compliance Verification Platform (SIH26100)',
        cloud: 'Cloudflare Pages Edge',
        database: 'Connected (Turso Cloud DB via libSQL: aws-ap-south-1 Mumbai)',
        seededBidders: bRes.rows[0].c,
        seededTenders: tRes.rows[0].c,
        seededBids: biRes.rows[0].c,
        timestamp: new Date().toISOString()
      });
    }

    // 1b. Blacklist Registry
    if (path === '/api/blacklist' && method === 'GET') {
      const { rows } = await executeSql('SELECT * FROM BlacklistRegistry ORDER BY id ASC');
      return jsonResponse({ success: true, count: rows.length, blacklist: rows });
    }

    if (path === '/api/blacklist/check' && method === 'POST') {
      const body = await request.json();
      const identifier = (body.identifier || body.pan_or_gstin || '').trim();
      if (!identifier) {
        return jsonResponse({ success: false, message: 'Identifier required' }, 400);
      }
      const { rows } = await executeSql(
        'SELECT * FROM BlacklistRegistry WHERE (pan_or_gstin = ? OR LOWER(entity_name) LIKE ?) AND (blacklisted = 1 OR blacklisted = true)',
        [identifier, `%${identifier.toLowerCase()}%`]
      );
      if (rows.length > 0) {
        return jsonResponse({ success: true, blacklisted: true, entry: rows[0] });
      }
      return jsonResponse({ success: true, blacklisted: false, message: 'Entity is clean and not listed on central debarment registers.' });
    }

    // 2. All Bidders
    if (path === '/api/bidders' && method === 'GET') {
      const { rows } = await executeSql('SELECT * FROM Bidder ORDER BY created_at ASC');
      return jsonResponse({ success: true, count: rows.length, bidders: rows });
    }

    // 3. Bidder Decision
    const decisionMatch = path.match(/^\/api\/bidders\/([^\/]+)\/decision$/);
    if (decisionMatch && method === 'POST') {
      const bidderId = decisionMatch[1];
      const body = await request.json();
      const decision = body.decision;
      const remarks = body.remarks || '';

      if (!decision || !['Approved', 'Rejected', 'Clarification Requested'].includes(decision)) {
        return jsonResponse({ success: false, message: 'Invalid decision value' }, 400);
      }

      const logId = crypto.randomUUID();
      const now = new Date().toISOString();
      const details = `Decision: ${decision}. Remarks: ${remarks}`;

      await executeSql(
        'INSERT INTO AuditLog (log_id, bidder_id, action, performed_by, details, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
        [logId, bidderId, 'OFFICER_DECISION', 'Officer', details, now]
      );

      return jsonResponse({
        success: true,
        message: 'Officer decision saved to audit trail',
        auditLog: {
          log_id: logId,
          bidder_id: bidderId,
          action: 'OFFICER_DECISION',
          performed_by: 'Officer',
          details,
          timestamp: now
        }
      });
    }

    // 3b. Bidder Bids (My Bids)
    const bidderBidsMatch = path.match(/^\/api\/bidders\/([^\/]+)\/bids$/);
    if (bidderBidsMatch && method === 'GET') {
      const bidderId = bidderBidsMatch[1];
      const { rows: bids } = await executeSql('SELECT * FROM Bid WHERE bidder_id = ? ORDER BY submitted_at DESC', [bidderId]);
      const enrichedBids = await Promise.all(bids.map(async b => {
        const { rows: tRows } = await executeSql('SELECT * FROM Tender WHERE tender_id = ?', [b.tender_id]);
        return {
          ...b,
          tender: tRows[0] || null
        };
      }));
      return jsonResponse({ success: true, count: enrichedBids.length, bids: enrichedBids });
    }

    // 4. Bidder Compliance
    const complianceMatch = path.match(/^\/api\/bidders\/([^\/]+)\/compliance$/);
    if (complianceMatch && method === 'GET') {
      const bidderId = complianceMatch[1];
      const { rows } = await executeSql('SELECT * FROM VerificationResult WHERE bidder_id = ? ORDER BY checked_at DESC', [bidderId]);
      if (rows.length === 0) {
        return jsonResponse({ success: false, message: 'No verification results found' }, 404);
      }

      // Fetch documents to factor in certificate discrepancies from the vault
      const { rows: docRows } = await executeSql('SELECT * FROM Document WHERE bidder_id = ?', [bidderId]);

      const scoreData = calculateScore(rows, docRows);
      return jsonResponse({
        success: true,
        bidder_id: bidderId,
        score: scoreData.score,
        risk: scoreData.risk,
        recommendation: scoreData.recommendation,
        flags: scoreData.flags,
        breakdown: rows,
        flagged_documents: scoreData.flaggedDocuments || []
      });
    }

    // 5. Run Verification
    const verifyMatch = path.match(/^\/api\/bidders\/([^\/]+)\/verify$/);
    if (verifyMatch && method === 'POST') {
      const bidderId = verifyMatch[1];
      const bRes = await executeSql('SELECT * FROM Bidder WHERE bidder_id = ?', [bidderId]);
      if (bRes.rows.length === 0) {
        return jsonResponse({ success: false, message: 'Bidder not found' }, 404);
      }
      const bidder = bRes.rows[0];

      // Delete existing verification results
      await executeSql('DELETE FROM VerificationResult WHERE bidder_id = ?', [bidderId]);

      const now = new Date().toISOString();
      const checks = [];

      // 1. UDYAM
      const uRes = await executeSql('SELECT * FROM UdyamRegistry WHERE udyam_number = ?', [bidder.udyam_number]);
      const udyam = uRes.rows[0];
      const udyamMatch = udyam && udyam.status === 'Active';
      checks.push({
        check_id: crypto.randomUUID(),
        bidder_id: bidderId,
        check_type: 'UDYAM_STATUS',
        document_value: 'Active',
        portal_value: udyam ? udyam.status : 'Not Found',
        match_status: udyamMatch ? 'Match' : 'Mismatch',
        severity: udyamMatch ? 'Low' : 'High',
        checked_at: now
      });

      // 2. GST_STATUS
      const gRes = await executeSql('SELECT * FROM GstnRegistry WHERE gstin = ?', [bidder.gstin]);
      const gst = gRes.rows[0];
      const gstMatch = gst && gst.status === 'Active';
      checks.push({
        check_id: crypto.randomUUID(),
        bidder_id: bidderId,
        check_type: 'GST_STATUS',
        document_value: 'Active',
        portal_value: gst ? gst.status : 'Not Found',
        match_status: gstMatch ? 'Match' : 'Mismatch',
        severity: gstMatch ? 'Low' : 'High',
        checked_at: now
      });

      // 3. GST_RETURNS
      const retMatch = gst && (Number(gst.returns_pending) === 0);
      checks.push({
        check_id: crypto.randomUUID(),
        bidder_id: bidderId,
        check_type: 'GST_RETURNS',
        document_value: '0 Pending Returns Expected',
        portal_value: gst ? `${gst.returns_pending} Pending Returns` : 'Not Found',
        match_status: retMatch ? 'Match' : 'Mismatch',
        severity: 'Major',
        checked_at: now
      });

      // 4. PAN_COMPLIANCE
      const pRes = await executeSql('SELECT * FROM PanRegistry WHERE pan_number = ?', [bidder.pan_number]);
      const pan = pRes.rows[0];
      const panMatch = pan && (pan.itr_filed_last_year === 1 || pan.itr_filed_last_year === '1' || pan.itr_filed_last_year === true);
      checks.push({
        check_id: crypto.randomUUID(),
        bidder_id: bidderId,
        check_type: 'PAN_COMPLIANCE',
        document_value: bidder.pan_number,
        portal_value: pan ? `ITR Filed: ${pan.itr_filed_last_year} (Compliance: ${pan.compliance_status})` : 'Not Found',
        match_status: panMatch ? 'Match' : 'Mismatch',
        severity: 'Minor',
        checked_at: now
      });

      // 5. BLACKLIST_CHECK
      const blRes = await executeSql('SELECT * FROM BlacklistRegistry WHERE (pan_or_gstin = ? OR pan_or_gstin = ?) AND (blacklisted = 1 OR blacklisted = true)', [bidder.gstin, bidder.pan_number]);
      const bl = blRes.rows[0];
      const blMatch = !bl; // match if NOT blacklisted
      checks.push({
        check_id: crypto.randomUUID(),
        bidder_id: bidderId,
        check_type: 'BLACKLIST_CHECK',
        document_value: bidder.company_name,
        portal_value: bl ? `Debarred: ${bl.reason}` : 'Clean (Not Blacklisted)',
        match_status: blMatch ? 'Match' : 'Mismatch',
        severity: 'Critical',
        checked_at: now
      });

      // 6. NAME_MATCH
      const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const nameMatch = gst && norm(bidder.company_name) === norm(gst.legal_name);
      checks.push({
        check_id: crypto.randomUUID(),
        bidder_id: bidderId,
        check_type: 'NAME_MATCH',
        document_value: bidder.company_name,
        portal_value: gst ? gst.legal_name : 'Not Found',
        match_status: nameMatch ? 'Match' : 'Mismatch',
        severity: 'Major',
        checked_at: now
      });

      for (const c of checks) {
        await executeSql(
          'INSERT INTO VerificationResult (check_id, bidder_id, check_type, document_value, portal_value, match_status, severity, checked_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [c.check_id, c.bidder_id, c.check_type, c.document_value, c.portal_value, c.match_status, c.severity, c.checked_at]
        );
      }

      const { rows: docRows } = await executeSql('SELECT * FROM Document WHERE bidder_id = ?', [bidderId]);
      const scoreResult = calculateScore(checks, docRows);
      const logId = crypto.randomUUID();
      await executeSql(
        'INSERT INTO AuditLog (log_id, bidder_id, action, performed_by, details, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
        [logId, bidderId, 'SCORE_CALCULATED', 'System', `Score: ${scoreResult.score}/100, Risk: ${scoreResult.risk}, Rec: ${scoreResult.recommendation}`, now]
      );

      return jsonResponse({
        success: true,
        bidder_id: bidderId,
        score: scoreResult.score,
        risk: scoreResult.risk,
        recommendation: scoreResult.recommendation,
        flags: scoreResult.flags,
        breakdown: checks,
        flagged_documents: scoreResult.flaggedDocuments || []
      });
    }

    // 6. Bidder Audit Log
    const auditMatch = path.match(/^\/api\/bidders\/([^\/]+)\/audit-log$/);
    if (auditMatch && method === 'GET') {
      const bidderId = auditMatch[1];
      const { rows } = await executeSql('SELECT * FROM AuditLog WHERE bidder_id = ? ORDER BY timestamp DESC', [bidderId]);
      return jsonResponse({ success: true, count: rows.length, auditLogs: rows });
    }

    // 7. Bidder Documents (GET & POST)
    const docsMatch = path.match(/^\/api\/bidders\/([^\/]+)\/documents$/);
    if (docsMatch) {
      const bidderId = docsMatch[1];
      if (method === 'GET') {
        const { rows } = await executeSql('SELECT * FROM Document WHERE bidder_id = ? ORDER BY uploaded_at DESC', [bidderId]);
        const formatted = rows.map(r => {
          let ext = r.extracted_data;
          try { ext = JSON.parse(r.extracted_data); } catch (e) {}
          const isFlagged = r.flagged === 1 || r.flagged === '1' || r.flagged === true;
          return { ...r, extracted_data: ext, flagged: isFlagged };
        });
        return jsonResponse({ success: true, count: formatted.length, documents: formatted });
      }

      if (method === 'POST') {
        let docType = 'GST_CERT';
        let fileName = 'statutory_document.pdf';
        let base64Content = null;
        let mimeType = 'application/pdf';
        let clientExtracted = null;
        let clientFlagged = null;
        let clientFlagReason = null;

        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const body = await request.json();
          docType = body.doc_type || docType;
          fileName = body.file_name || fileName;
          base64Content = body.file_content || null;
          if (body.extracted_data) clientExtracted = body.extracted_data;
          if (body.flagged !== undefined) clientFlagged = body.flagged;
          if (body.flag_reason) clientFlagReason = body.flag_reason;
        } else if (contentType.includes('multipart/form-data')) {
          const formData = await request.formData();
          docType = formData.get('doc_type') || docType;
          const file = formData.get('file');
          if (formData.has('extracted_data')) {
            try { clientExtracted = JSON.parse(formData.get('extracted_data')); } catch (e) {}
          }
          if (formData.has('flagged')) {
            const fVal = formData.get('flagged');
            clientFlagged = fVal === '1' || fVal === 1 || fVal === 'true';
          }
          if (formData.has('flag_reason')) {
            clientFlagReason = formData.get('flag_reason');
          }

          if (file && file.name) {
            fileName = file.name;
            mimeType = file.type || 'application/octet-stream';
            try {
              const arrayBuf = await file.arrayBuffer();
              const bytes = new Uint8Array(arrayBuf);
              let binary = '';
              const chunkSize = 8192;
              for (let i = 0; i < bytes.length; i += chunkSize) {
                binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
              }
              base64Content = btoa(binary);
            } catch (e) {
              console.error('Failed to convert file to base64', e);
            }
          }
        }

        const bRes = await executeSql('SELECT * FROM Bidder WHERE bidder_id = ?', [bidderId]);
        const bidder = bRes.rows[0] || {};

        let flagged = 0;
        let flagReason = null;
        let extracted = null;

        // Multi-Layer Zero-Trust Document Authentication Engine
        let rawDecoded = '';
        if (base64Content) {
          try {
            const rawBinary = atob(base64Content.substring(0, 150000));
            rawDecoded = rawBinary.toUpperCase();
          } catch (e) {}
        }

        const bidderPan = (bidder.pan_number || '').toUpperCase().trim();
        const bidderGstin = (bidder.gstin || '').toUpperCase().trim();
        const bidderUdyamNorm = (bidder.udyam_number || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

        if (clientFlagged === true || clientFlagged === 1 || clientFlagged === '1') {
          flagged = 1;
          flagReason = clientFlagReason || 'Discrepancy detected during statutory document scan';
          extracted = clientExtracted || { document_type: docType, file_name: fileName, identified_number: null };
        } else {
          // Independent Server-Side Authenticity Verification
          if (docType === 'PAN_CARD') {
            const panMatch = rawDecoded.match(/\b([A-Z]{5}[0-9]{4}[A-Z])\b/);
            const clientHasPan = clientExtracted && clientExtracted.identified_number;
            const extractedPan = panMatch ? panMatch[1] : (clientHasPan ? clientExtracted.identified_number : null);

            if (!extractedPan) {
              flagged = 1;
              flagReason = 'Invalid or Non-Statutory Document: No valid 10-character PAN pattern detected in uploaded file.';
              extracted = { document_type: 'Permanent Account Number Card', file_name: fileName, identified_number: null };
            } else if (bidderPan && extractedPan !== bidderPan) {
              flagged = 1;
              flagReason = `Identity Mismatch: Extracted PAN (${extractedPan}) does not match registered enterprise PAN (${bidderPan}).`;
              extracted = { document_type: 'Permanent Account Number Card', file_name: fileName, identified_number: extractedPan };
            } else {
              extracted = clientExtracted || { document_type: 'Permanent Account Number Card', file_name: fileName, identified_number: extractedPan };
            }
          } else if (docType === 'GST_CERT') {
            const gstMatch = rawDecoded.match(/\b([0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z])\b/);
            const panInDoc = bidderPan && rawDecoded.includes(bidderPan);
            const clientHasGst = clientExtracted && clientExtracted.identified_number;
            const extractedGst = gstMatch ? gstMatch[1] : (clientHasGst ? clientExtracted.identified_number : null);

            if (!extractedGst && !panInDoc) {
              flagged = 1;
              flagReason = 'Invalid or Non-Statutory Document: No valid 15-character GSTIN pattern detected in uploaded file.';
              extracted = { document_type: 'Form GST REG-06 Certificate', file_name: fileName, identified_number: null };
            } else if (bidderGstin && extractedGst && extractedGst !== bidderGstin && !panInDoc) {
              flagged = 1;
              flagReason = `GSTIN Mismatch: Extracted GSTIN (${extractedGst}) does not match registered enterprise GSTIN (${bidderGstin}).`;
              extracted = { document_type: 'Form GST REG-06 Certificate', file_name: fileName, identified_number: extractedGst };
            } else {
              extracted = clientExtracted || { document_type: 'Form GST REG-06 Certificate', file_name: fileName, identified_number: extractedGst || bidderGstin };
            }
          } else if (docType === 'UDYAM_CERT') {
            const udyamMatch = rawDecoded.match(/\b(UDYAM\s*[-/]?\s*[A-Z]{2}\s*[-/]?\s*[0-9]{2}\s*[-/]?\s*[0-9]{7})\b/);
            const clientHasUdyam = clientExtracted && clientExtracted.identified_number;
            const rawUdyam = udyamMatch ? udyamMatch[1].replace(/[^A-Z0-9]/g, '') : (clientHasUdyam ? String(clientExtracted.identified_number).replace(/[^A-Z0-9]/g, '') : null);

            if (!rawUdyam) {
              flagged = 1;
              flagReason = 'Invalid or Non-Statutory Document: No valid MSME Udyam registration number detected in uploaded file.';
              extracted = { document_type: 'Udyam Registration Certificate', file_name: fileName, identified_number: null };
            } else if (bidderUdyamNorm && rawUdyam !== bidderUdyamNorm) {
              flagged = 1;
              flagReason = `Udyam Mismatch: Extracted registration (${rawUdyam}) does not match registered enterprise Udyam (${bidder.udyam_number}).`;
              extracted = { document_type: 'Udyam Registration Certificate', file_name: fileName, identified_number: rawUdyam };
            } else {
              extracted = clientExtracted || { document_type: 'Udyam Registration Certificate', file_name: fileName, identified_number: bidder.udyam_number || rawUdyam };
            }
          } else {
            extracted = clientExtracted || { document_type: docType, file_name: fileName, identified_number: null };
          }
        }

        const docId = crypto.randomUUID();
        const now = new Date().toISOString();
        const fileUrl = `/uploads/${fileName}`;

        await executeSql(
          'INSERT INTO Document (doc_id, bidder_id, doc_type, file_url, extracted_data, flagged, flag_reason, uploaded_at, file_content) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [docId, bidderId, docType, fileUrl, JSON.stringify(extracted), flagged, flagReason, now, base64Content]
        );

        const logId = crypto.randomUUID();
        await executeSql(
          'INSERT INTO AuditLog (log_id, bidder_id, action, performed_by, details, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
          [logId, bidderId, 'DOCUMENT_UPLOADED', 'Admin / Procurement Officer', `Uploaded ${docType} (${fileName}). Statutory check: ${flagged === 1 ? 'FLAGGED: ' + flagReason : 'Passed Clean'}`, now]
        );

        return jsonResponse({
          success: true,
          message: 'Document uploaded and analyzed successfully',
          document: {
            doc_id: docId,
            bidder_id: bidderId,
            doc_type: docType,
            file_url: fileUrl,
            extracted_data: extracted,
            flagged: Boolean(flagged === 1),
            flag_reason: flagReason,
            uploaded_at: now
          }
        });
      }
    }

    // 7b. Single Document Deletion or Fetch
    const singleDocMatch = path.match(/^\/api\/bidders\/([^\/]+)\/documents\/([^\/]+)$/);
    if (singleDocMatch) {
      const bidderId = singleDocMatch[1];
      const docId = singleDocMatch[2];

      if (method === 'DELETE') {
        const dRes = await executeSql('SELECT * FROM Document WHERE doc_id = ? AND bidder_id = ?', [docId, bidderId]);
        if (dRes.rows.length === 0) {
          return jsonResponse({ success: false, message: 'Document not found or does not belong to this bidder' }, 404);
        }
        const doc = dRes.rows[0];
        await executeSql('DELETE FROM Document WHERE doc_id = ? AND bidder_id = ?', [docId, bidderId]);

        const logId = crypto.randomUUID();
        const now = new Date().toISOString();
        await executeSql(
          'INSERT INTO AuditLog (log_id, bidder_id, action, performed_by, details, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
          [logId, bidderId, 'DOCUMENT_DELETED', 'Vendor / Officer', `Deleted statutory certificate "${doc.doc_type}" (${doc.file_url || docId}) from vault`, now]
        );

        return jsonResponse({ success: true, message: 'Document deleted successfully', doc_id: docId });
      }

      if (method === 'GET') {
        const dRes = await executeSql('SELECT * FROM Document WHERE doc_id = ? AND bidder_id = ?', [docId, bidderId]);
        if (dRes.rows.length === 0) return jsonResponse({ success: false, message: 'Document not found' }, 404);
        const r = dRes.rows[0];
        let ext = r.extracted_data;
        try { ext = JSON.parse(r.extracted_data); } catch (e) {}
        return jsonResponse({ success: true, document: { ...r, extracted_data: ext, flagged: Boolean(r.flagged) } });
      }
    }

    // 8. Single Bidder (GET & PUT)
    const singleBidderMatch = path.match(/^\/api\/bidders\/([^\/]+)$/);
    if (singleBidderMatch) {
      const bidderId = singleBidderMatch[1];
      if (method === 'GET') {
        const { rows } = await executeSql('SELECT * FROM Bidder WHERE bidder_id = ?', [bidderId]);
        if (rows.length === 0) return jsonResponse({ success: false, message: 'Bidder not found' }, 404);
        return jsonResponse({ success: true, bidder: rows[0] });
      }
      if (method === 'PUT' || method === 'PATCH') {
        const body = await request.json();
        const { phone, email, registered_address } = body;
        const updates = [];
        const args = [];
        if (phone !== undefined) { updates.push('phone = ?'); args.push(phone); }
        if (email !== undefined) { updates.push('email = ?'); args.push(email); }
        if (registered_address !== undefined) { updates.push('registered_address = ?'); args.push(registered_address); }

        if (updates.length > 0) {
          args.push(bidderId);
          await executeSql(`UPDATE Bidder SET ${updates.join(', ')} WHERE bidder_id = ?`, args);

          const logId = crypto.randomUUID();
          const now = new Date().toISOString();
          await executeSql(
            'INSERT INTO AuditLog (log_id, bidder_id, action, performed_by, details, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
            [logId, bidderId, 'PROFILE_UPDATED', 'Vendor', `Updated corporate profile contact and registered details`, now]
          );
        }
        const { rows } = await executeSql('SELECT * FROM Bidder WHERE bidder_id = ?', [bidderId]);
        return jsonResponse({ success: true, message: 'Profile updated successfully', bidder: rows[0] });
      }
    }

    // 9. All Tenders
    if (path === '/api/tenders' && method === 'GET') {
      const { rows: tenders } = await executeSql('SELECT * FROM Tender ORDER BY created_at ASC');
      const { rows: bidCounts } = await executeSql('SELECT tender_id, COUNT(*) as bid_count FROM Bid GROUP BY tender_id');
      const countMap = {};
      bidCounts.forEach(b => { countMap[b.tender_id] = b.bid_count; });

      const tendersWithCount = tenders.map(t => ({
        ...t,
        bid_count: countMap[t.tender_id] || 0
      }));
      return jsonResponse({ success: true, count: tendersWithCount.length, tenders: tendersWithCount });
    }

    // 10. Tender Award
    const awardMatch = path.match(/^\/api\/tenders\/([^\/]+)\/award$/);
    if (awardMatch && method === 'POST') {
      const tenderId = awardMatch[1];
      const body = await request.json();
      const bidderId = body.bidder_id;

      if (!bidderId) {
        return jsonResponse({ success: false, message: 'bidder_id is required to award tender' }, 400);
      }

      const tRes = await executeSql('SELECT * FROM Tender WHERE tender_id = ?', [tenderId]);
      if (tRes.rows.length === 0) return jsonResponse({ success: false, message: 'Tender not found' }, 404);
      if (tRes.rows[0].status === 'Awarded') {
        return jsonResponse({ success: false, message: 'Tender has already been awarded and is closed for further action.' }, 400);
      }

      // Update Tender status
      await executeSql('UPDATE Tender SET status = ? WHERE tender_id = ?', ['Awarded', tenderId]);
      // Update Bids
      await executeSql('UPDATE Bid SET status = ? WHERE tender_id = ? AND bidder_id = ?', ['Awarded', tenderId, bidderId]);
      await executeSql('UPDATE Bid SET status = ? WHERE tender_id = ? AND bidder_id != ?', ['Rejected', tenderId, bidderId]);

      // Calculate compliance of winning bidder
      const vRes = await executeSql('SELECT * FROM VerificationResult WHERE bidder_id = ?', [bidderId]);
      const comp = calculateScore(vRes.rows);

      let warning = null;
      if (comp.recommendation === 'Non-Compliant') {
        warning = 'WARNING: Tender awarded to a bidder with Non-Compliant status. Officer discretion applied under GFR 2017.';
      }

      const logId = crypto.randomUUID();
      const now = new Date().toISOString();
      const auditDetails = `Tender '${tRes.rows[0].title}' awarded to Bidder ID ${bidderId}.${warning ? ' ' + warning : ''}`;

      await executeSql(
        'INSERT INTO AuditLog (log_id, bidder_id, action, performed_by, details, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
        [logId, bidderId, 'TENDER_AWARDED', 'Officer', auditDetails, now]
      );

      const winBidRes = await executeSql('SELECT * FROM Bid WHERE tender_id = ? AND bidder_id = ?', [tenderId, bidderId]);

      return jsonResponse({
        success: true,
        message: 'Tender successfully awarded',
        tender: { ...tRes.rows[0], status: 'Awarded' },
        winning_bid: winBidRes.rows[0] || null,
        warning
      });
    }

    // 11. Tender Bids
    const bidsMatch = path.match(/^\/api\/tenders\/([^\/]+)\/bids$/);
    if (bidsMatch && method === 'GET') {
      const tenderId = bidsMatch[1];
      const { rows: bids } = await executeSql(
        'SELECT b.*, bd.company_name, bd.gstin, bd.pan_number, bd.udyam_number FROM Bid b JOIN Bidder bd ON b.bidder_id = bd.bidder_id WHERE b.tender_id = ? ORDER BY b.bid_amount ASC',
        [tenderId]
      );

      const bidsWithComp = await Promise.all(bids.map(async bid => {
        const { rows: checks } = await executeSql('SELECT * FROM VerificationResult WHERE bidder_id = ?', [bid.bidder_id]);
        const comp = checks.length > 0 ? calculateScore(checks) : null;
        return {
          ...bid,
          compliance: comp
        };
      }));

      return jsonResponse({ success: true, count: bidsWithComp.length, bids: bidsWithComp });
    }

    // 11b. Tender Bid Submission (POST)
    if (bidsMatch && method === 'POST') {
      const tenderId = bidsMatch[1];
      const body = await request.json();
      const { bidder_id, bid_amount } = body;

      if (!bidder_id || !bid_amount) {
        return jsonResponse({ success: false, message: 'bidder_id and bid_amount are required' }, 400);
      }

      const tRes = await executeSql('SELECT * FROM Tender WHERE tender_id = ?', [tenderId]);
      if (tRes.rows.length === 0) return jsonResponse({ success: false, message: 'Tender not found' }, 404);
      if (tRes.rows[0].status === 'Awarded' || tRes.rows[0].status === 'Closed') {
        return jsonResponse({ success: false, message: 'This tender is closed for bidding' }, 400);
      }

      const numericAmount = parseFloat(bid_amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return jsonResponse({ success: false, message: 'Valid positive bid_amount is required' }, 400);
      }

      const existing = await executeSql('SELECT * FROM Bid WHERE tender_id = ? AND bidder_id = ?', [tenderId, bidder_id]);
      if (existing.rows.length > 0) {
        const now = new Date().toISOString();
        await executeSql('UPDATE Bid SET bid_amount = ?, submitted_at = ? WHERE bid_id = ?', [numericAmount, now, existing.rows[0].bid_id]);
        await executeSql(
          'INSERT INTO AuditLog (log_id, bidder_id, action, performed_by, details, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
          [crypto.randomUUID(), bidder_id, 'BID_REVISED', 'Bidder', `Revised quotation to ₹${numericAmount.toLocaleString('en-IN')} for tender "${tRes.rows[0].title}"`, now]
        );
        return jsonResponse({ success: true, message: 'Bid quotation updated successfully' });
      }

      const newBidId = crypto.randomUUID();
      const now = new Date().toISOString();
      await executeSql(
        'INSERT INTO Bid (bid_id, tender_id, bidder_id, bid_amount, status, submitted_at) VALUES (?, ?, ?, ?, ?, ?)',
        [newBidId, tenderId, bidder_id, numericAmount, 'Submitted', now]
      );
      await executeSql(
        'INSERT INTO AuditLog (log_id, bidder_id, action, performed_by, details, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), bidder_id, 'BID_SUBMITTED', 'Bidder', `Submitted bid of ₹${numericAmount.toLocaleString('en-IN')} for tender "${tRes.rows[0].title}"`, now]
      );
      return jsonResponse({ success: true, message: 'Bid submitted successfully', bid_id: newBidId });
    }

    // 12. Single Tender
    const singleTenderMatch = path.match(/^\/api\/tenders\/([^\/]+)$/);
    if (singleTenderMatch && method === 'GET') {
      const tenderId = singleTenderMatch[1];
      const { rows } = await executeSql('SELECT * FROM Tender WHERE tender_id = ?', [tenderId]);
      if (rows.length === 0) return jsonResponse({ success: false, message: 'Tender not found' }, 404);
      return jsonResponse({ success: true, tender: rows[0] });
    }



    return jsonResponse({ success: false, message: `Route ${path} not found` }, 404);

  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}
