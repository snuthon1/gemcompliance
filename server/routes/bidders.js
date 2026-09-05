const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const prisma = require('../db');

const { runVerification } = require('../services/verificationEngine');
const { calculateScore } = require('../services/scoringEngine');
const { extractDocumentData } = require('../services/extractionService');

// Multer storage configuration for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// GET /api/bidders - List all bidders
router.get('/', async (req, res) => {
  try {
    const bidders = await prisma.bidder.findMany({
      orderBy: { created_at: 'asc' }
    });
    res.json({ success: true, count: bidders.length, bidders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/bidders/:bidder_id/documents
// Uploads a statutory document, extracts data via AI/mock, logs audit entry, checks for mismatch flag
router.post('/:bidder_id/documents', upload.single('file'), async (req, res) => {
  const { bidder_id } = req.params;
  const { doc_type } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No document file uploaded' });
    }
    if (!doc_type) {
      return res.status(400).json({ success: false, message: 'doc_type is required (e.g. GST_CERT, PAN_CARD, UDYAM_CERT)' });
    }

    const bidder = await prisma.bidder.findUnique({
      where: { bidder_id }
    });
    if (!bidder) {
      return res.status(404).json({ success: false, message: 'Bidder not found' });
    }

    // Call extraction function
    const filePath = req.file.path;
    const extractedData = await extractDocumentData(filePath, doc_type, bidder, req.file.originalname);

    // PART C: Cross-check extracted entity name against bidder registration
    let flagged = false;
    let flag_reason = null;

    if (extractedData.entity_name) {
      const extractedName = extractedData.entity_name.trim().toLowerCase();
      const bidderName = bidder.company_name.trim().toLowerCase();

      if (extractedName !== bidderName) {
        flagged = true;
        flag_reason = 'Uploaded document name does not match bidder registration — flagged for manual review';
      }
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    // Create Document record
    const document = await prisma.document.create({
      data: {
        bidder_id,
        doc_type,
        file_url: fileUrl,
        extracted_data: JSON.stringify(extractedData),
        flagged,
        flag_reason
      }
    });

    // Write AuditLog entry: action "DOCUMENT_UPLOADED", performed_by "System", details "Uploaded [doc_type] document, extracted fields: [summary]"
    const summaryParts = [];
    if (extractedData.entity_name) summaryParts.push(`entity: ${extractedData.entity_name}`);
    if (extractedData.registration_number) summaryParts.push(`reg: ${extractedData.registration_number}`);
    if (extractedData.document_type) summaryParts.push(`type: ${extractedData.document_type}`);
    const summary = summaryParts.join(', ') || 'statutory fields extracted';

    await prisma.auditLog.create({
      data: {
        bidder_id,
        action: 'DOCUMENT_UPLOADED',
        performed_by: 'System',
        details: `Uploaded ${doc_type} document, extracted fields: ${summary}${flagged ? ' [FLAGGED FOR MANUAL REVIEW]' : ''}`
      }
    });

    res.json({
      success: true,
      message: 'Document uploaded and analyzed successfully',
      document: {
        ...document,
        extracted_data: extractedData
      }
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/bidders/:bidder_id/documents
// Lists all documents uploaded for a bidder
router.get('/:bidder_id/documents', async (req, res) => {
  const { bidder_id } = req.params;
  try {
    const documents = await prisma.document.findMany({
      where: { bidder_id },
      orderBy: { uploaded_at: 'desc' }
    });

    const parsedDocs = documents.map(doc => {
      let parsed = {};
      try {
        parsed = JSON.parse(doc.extracted_data);
      } catch (e) {
        parsed = {};
      }
      return {
        ...doc,
        extracted_data: parsed
      };
    });

    res.json({ success: true, count: parsedDocs.length, documents: parsedDocs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/bidders/:bidder_id/documents/:doc_id
router.delete('/:bidder_id/documents/:doc_id', async (req, res) => {
  const { bidder_id, doc_id } = req.params;
  try {
    const doc = await prisma.document.findFirst({
      where: { doc_id, bidder_id }
    });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    await prisma.document.delete({
      where: { doc_id }
    });

    await prisma.auditLog.create({
      data: {
        bidder_id,
        action: 'DOCUMENT_DELETED',
        performed_by: 'Vendor / Officer',
        details: `Deleted statutory certificate "${doc.doc_type}" (${doc.file_url || doc_id})`
      }
    });

    res.json({ success: true, message: 'Document deleted successfully', doc_id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/bidders/:bidder_id
router.put('/:bidder_id', async (req, res) => {
  const { bidder_id } = req.params;
  const { phone, email, registered_address } = req.body;
  try {
    const data = {};
    if (phone !== undefined) data.phone = phone;
    if (email !== undefined) data.email = email;
    if (registered_address !== undefined) data.registered_address = registered_address;

    const updated = await prisma.bidder.update({
      where: { bidder_id },
      data
    });

    await prisma.auditLog.create({
      data: {
        bidder_id,
        action: 'PROFILE_UPDATED',
        performed_by: 'Vendor',
        details: 'Updated corporate profile contact and registered details'
      }
    });

    res.json({ success: true, message: 'Profile updated successfully', bidder: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/bidders/:bidder_id/verify
// Runs 6 verification checks, calculates score, logs audit entry, returns full results
router.post('/:bidder_id/verify', async (req, res) => {
  const { bidder_id } = req.params;

  try {
    const bidder = await prisma.bidder.findUnique({
      where: { bidder_id }
    });
    if (!bidder) {
      return res.status(404).json({ success: false, message: 'Bidder not found' });
    }

    const verificationResults = await runVerification(bidder_id);
    const evaluation = calculateScore(verificationResults);

    // Write SCORE_CALCULATED audit entry
    await prisma.auditLog.create({
      data: {
        bidder_id,
        action: 'SCORE_CALCULATED',
        performed_by: 'System',
        details: `Score: ${evaluation.score}, Risk: ${evaluation.risk}, Recommendation: ${evaluation.recommendation}`
      }
    });

    res.json({
      success: true,
      bidder_id,
      verificationResults,
      score: evaluation.score,
      risk: evaluation.risk,
      recommendation: evaluation.recommendation,
      flags: evaluation.flags
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/bidders/:bidder_id/compliance
// Returns MOST RECENT verification results + calculated score for a bidder
router.get('/:bidder_id/compliance', async (req, res) => {
  const { bidder_id } = req.params;

  try {
    const latestCheck = await prisma.verificationResult.findFirst({
      where: { bidder_id },
      orderBy: { checked_at: 'desc' }
    });

    if (!latestCheck) {
      return res.status(404).json({
        success: false,
        message: 'No verification results found for this bidder. Run POST /api/bidders/:bidder_id/verify first.'
      });
    }

    const latestTimestamp = latestCheck.checked_at;
    const windowStart = new Date(latestTimestamp.getTime() - 3000);
    const windowEnd = new Date(latestTimestamp.getTime() + 3000);

    const latestResults = await prisma.verificationResult.findMany({
      where: {
        bidder_id,
        checked_at: {
          gte: windowStart,
          lte: windowEnd
        }
      }
    });

    const evaluation = calculateScore(latestResults);

    res.json({
      success: true,
      bidder_id,
      checked_at: latestTimestamp,
      verificationResults: latestResults,
      score: evaluation.score,
      risk: evaluation.risk,
      recommendation: evaluation.recommendation,
      flags: evaluation.flags
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/bidders/:bidder_id/decision
// Body: { decision: "Approved" | "Rejected" | "Clarification Requested", remarks: string }
router.post('/:bidder_id/decision', async (req, res) => {
  const { bidder_id } = req.params;
  const { decision, remarks } = req.body;

  if (!decision) {
    return res.status(400).json({ success: false, message: 'Decision field is required' });
  }

  const validDecisions = ['Approved', 'Rejected', 'Clarification Requested', 'Request Clarification'];
  if (!validDecisions.includes(decision)) {
    return res.status(400).json({
      success: false,
      message: `Invalid decision. Must be one of: Approved, Rejected, Clarification Requested`
    });
  }

  const normalizedDecision = decision === 'Request Clarification' ? 'Clarification Requested' : decision;
  const remarksText = remarks && remarks.trim() ? remarks.trim() : 'No remarks specified';

  try {
    const bidder = await prisma.bidder.findUnique({
      where: { bidder_id }
    });

    if (!bidder) {
      return res.status(404).json({ success: false, message: 'Bidder not found' });
    }

    const auditEntry = await prisma.auditLog.create({
      data: {
        bidder_id,
        action: 'OFFICER_DECISION',
        performed_by: 'Officer',
        details: `Decision: ${normalizedDecision}. Remarks: ${remarksText}`
      }
    });

    res.json({
      success: true,
      message: 'Officer decision recorded successfully in audit trail',
      decision: normalizedDecision,
      remarks: remarksText,
      auditLog: auditEntry
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/bidders/:bidder_id/audit-log
// Returns all AuditLog rows for that bidder, ordered by timestamp descending
router.get('/:bidder_id/audit-log', async (req, res) => {
  const { bidder_id } = req.params;

  try {
    const auditLogs = await prisma.auditLog.findMany({
      where: { bidder_id },
      orderBy: { timestamp: 'desc' }
    });

    res.json({
      success: true,
      count: auditLogs.length,
      auditLogs
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/bidders/:bidder_id/bids - Get all tender bids submitted by this bidder
router.get('/:bidder_id/bids', async (req, res) => {
  try {
    const { bidder_id } = req.params;
    const bids = await prisma.bid.findMany({
      where: { bidder_id },
      orderBy: { submitted_at: 'desc' }
    });

    const enrichedBids = await Promise.all(
      bids.map(async (b) => {
        const tender = await prisma.tender.findUnique({
          where: { tender_id: b.tender_id }
        });
        return {
          ...b,
          tender
        };
      })
    );

    res.json({ success: true, count: enrichedBids.length, bids: enrichedBids });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/bidders/:bidder_id - Single bidder profile
router.get('/:bidder_id', async (req, res) => {
  try {
    const bidder = await prisma.bidder.findUnique({
      where: { bidder_id: req.params.bidder_id }
    });
    if (!bidder) {
      return res.status(404).json({ success: false, message: 'Bidder not found' });
    }
    res.json({ success: true, bidder });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
