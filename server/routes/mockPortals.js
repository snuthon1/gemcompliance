const express = require('express');
const router = express.Router();
const prisma = require('../db');

// GET /api/mock-udyam/verify?udyam_number=XXX
router.get('/mock-udyam/verify', async (req, res) => {
  const { udyam_number } = req.query;
  if (!udyam_number) {
    return res.status(400).json({ success: false, message: 'udyam_number query parameter is required' });
  }

  try {
    const record = await prisma.udyamRegistry.findUnique({
      where: { udyam_number: String(udyam_number).trim() }
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        portal: 'Ministry of MSME - Udyam Registration Portal',
        message: 'Udyam registration not found in National MSME Databank',
        udyam_number
      });
    }

    res.json({
      success: true,
      portal: 'Ministry of MSME - Udyam Registration Portal',
      status: 200,
      data: record
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/mock-gstn/verify?gstin=XXX
router.get('/mock-gstn/verify', async (req, res) => {
  const { gstin } = req.query;
  if (!gstin) {
    return res.status(400).json({ success: false, message: 'gstin query parameter is required' });
  }

  try {
    const record = await prisma.gstnRegistry.findUnique({
      where: { gstin: String(gstin).trim() }
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        portal: 'Goods and Services Tax Network (GSTN)',
        message: 'GSTIN not found in GSTN Master Database',
        gstin
      });
    }

    res.json({
      success: true,
      portal: 'Goods and Services Tax Network (GSTN)',
      status: 200,
      data: record
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/mock-pan/verify?pan_number=XXX
router.get('/mock-pan/verify', async (req, res) => {
  const { pan_number } = req.query;
  if (!pan_number) {
    return res.status(400).json({ success: false, message: 'pan_number query parameter is required' });
  }

  try {
    const record = await prisma.panRegistry.findUnique({
      where: { pan_number: String(pan_number).trim() }
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        portal: 'Income Tax Department (CBDT) - NSDL/UTIITSL',
        message: 'PAN record not found on Income Tax portal',
        pan_number
      });
    }

    res.json({
      success: true,
      portal: 'Income Tax Department (CBDT)',
      status: 200,
      data: record
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/mock-blacklist/check?pan_or_gstin=XXX
router.get('/mock-blacklist/check', async (req, res) => {
  const { pan_or_gstin } = req.query;
  if (!pan_or_gstin) {
    return res.status(400).json({ success: false, message: 'pan_or_gstin query parameter is required' });
  }

  try {
    const queryTerm = String(pan_or_gstin).trim();
    // Search exact PAN or GSTIN
    const record = await prisma.blacklistRegistry.findFirst({
      where: {
        pan_or_gstin: queryTerm,
        blacklisted: true
      }
    });

    if (record) {
      return res.json({
        success: true,
        portal: 'Central Vigilance Commission (CVC) / MoPNG Debarment Register',
        blacklisted: true,
        details: record
      });
    }

    res.json({
      success: true,
      portal: 'Central Vigilance Commission (CVC) / MoPNG Debarment Register',
      blacklisted: false,
      details: null
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
