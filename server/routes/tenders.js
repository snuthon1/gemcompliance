const express = require('express');
const router = express.Router();
const prisma = require('../db');

const { runVerification } = require('../services/verificationEngine');
const { calculateScore } = require('../services/scoringEngine');

// Helper to get or run latest compliance for a bidder
async function getBidderCompliance(bidder_id) {
  try {
    const latestCheck = await prisma.verificationResult.findFirst({
      where: { bidder_id },
      orderBy: { checked_at: 'desc' }
    });

    let results = [];
    if (!latestCheck) {
      results = await runVerification(bidder_id);
    } else {
      const latestTimestamp = latestCheck.checked_at;
      const windowStart = new Date(latestTimestamp.getTime() - 3000);
      const windowEnd = new Date(latestTimestamp.getTime() + 3000);

      results = await prisma.verificationResult.findMany({
        where: {
          bidder_id,
          checked_at: {
            gte: windowStart,
            lte: windowEnd
          }
        }
      });
      if (results.length === 0) {
        results = await runVerification(bidder_id);
      }
    }

    const evaluation = calculateScore(results);
    return {
      score: evaluation.score,
      risk: evaluation.risk,
      recommendation: evaluation.recommendation,
      flags: evaluation.flags
    };
  } catch (err) {
    console.error(`Error calculating compliance for ${bidder_id}:`, err);
    return {
      score: 0,
      risk: 'High',
      recommendation: 'Non-Compliant',
      flags: ['Error evaluating compliance']
    };
  }
}

// GET /api/tenders -> list all tenders with bid count per tender
router.get('/', async (req, res) => {
  try {
    const tenders = await prisma.tender.findMany({
      orderBy: { created_at: 'asc' }
    });

    const tendersWithCount = await Promise.all(
      tenders.map(async (t) => {
        const bidCount = await prisma.bid.count({
          where: { tender_id: t.tender_id }
        });
        return {
          ...t,
          bid_count: bidCount
        };
      })
    );

    res.json({ success: true, count: tendersWithCount.length, tenders: tendersWithCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/tenders/:tender_id -> tender details
router.get('/:tender_id', async (req, res) => {
  try {
    const tender = await prisma.tender.findUnique({
      where: { tender_id: req.params.tender_id }
    });

    if (!tender) {
      return res.status(404).json({ success: false, message: 'Tender not found' });
    }

    const bidCount = await prisma.bid.count({
      where: { tender_id: tender.tender_id }
    });

    res.json({ success: true, tender: { ...tender, bid_count: bidCount } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/tenders/:tender_id/bids
// Returns all bids for a tender, each bid JOINED with the bidder's company details & latest compliance data
router.get('/:tender_id/bids', async (req, res) => {
  try {
    const { tender_id } = req.params;

    const bids = await prisma.bid.findMany({
      where: { tender_id },
      orderBy: { bid_amount: 'asc' }
    });

    const enrichedBids = await Promise.all(
      bids.map(async (b) => {
        const bidder = await prisma.bidder.findUnique({
          where: { bidder_id: b.bidder_id }
        });

        const compliance = await getBidderCompliance(b.bidder_id);

        return {
          bid_id: b.bid_id,
          tender_id: b.tender_id,
          bidder_id: b.bidder_id,
          bid_amount: b.bid_amount,
          submitted_at: b.submitted_at,
          status: b.status,
          company_name: bidder ? bidder.company_name : 'Unknown Company',
          gstin: bidder ? bidder.gstin : '',
          pan_number: bidder ? bidder.pan_number : '',
          udyam_number: bidder ? bidder.udyam_number : '',
          compliance
        };
      })
    );

    res.json({ success: true, count: enrichedBids.length, bids: enrichedBids });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/tenders/:tender_id/award
// Body: { bidder_id }
router.post('/:tender_id/award', async (req, res) => {
  try {
    const { tender_id } = req.params;
    const { bidder_id } = req.body;

    if (!bidder_id) {
      return res.status(400).json({ success: false, message: 'bidder_id is required in body' });
    }

    const tender = await prisma.tender.findUnique({ where: { tender_id } });
    if (!tender) {
      return res.status(404).json({ success: false, message: 'Tender not found' });
    }

    if (tender.status === 'Awarded') {
      return res.status(400).json({
        success: false,
        message: `Tender "${tender.title}" has already been awarded and contract is executed. Cannot re-award.`
      });
    }

    const targetBid = await prisma.bid.findFirst({
      where: { tender_id, bidder_id }
    });
    if (!targetBid) {
      return res.status(404).json({ success: false, message: 'Bid not found for this bidder on this tender' });
    }

    const bidder = await prisma.bidder.findUnique({ where: { bidder_id } });
    const compliance = await getBidderCompliance(bidder_id);

    // 1. Update target bid status to "Awarded"
    await prisma.bid.update({
      where: { bid_id: targetBid.bid_id },
      data: { status: 'Awarded' }
    });

    // 2. Set all other bids on this tender to "Rejected"
    await prisma.bid.updateMany({
      where: {
        tender_id,
        bid_id: { not: targetBid.bid_id }
      },
      data: { status: 'Rejected' }
    });

    // 3. Set Tender status to "Awarded"
    await prisma.tender.update({
      where: { tender_id },
      data: { status: 'Awarded' }
    });

    // 4. Write AuditLog entry
    const auditDetails = `Awarded to ${bidder ? bidder.company_name : bidder_id} for tender "${tender.title}" at bid amount ₹${targetBid.bid_amount.toLocaleString('en-IN')}. Compliance recommendation was: ${compliance.recommendation} (Score: ${compliance.score}/100).`;
    await prisma.auditLog.create({
      data: {
        bidder_id,
        action: 'TENDER_AWARDED',
        performed_by: 'Officer',
        details: auditDetails
      }
    });

    // 5. Check if Non-Compliant warning applies
    let warning = null;
    if (compliance.recommendation === 'Non-Compliant') {
      warning = "This bidder's current compliance recommendation is Non-Compliant. Awarding despite AI recommendation.";
    }

    res.json({
      success: true,
      message: `Tender successfully awarded to ${bidder ? bidder.company_name : bidder_id}`,
      tender_id,
      awarded_bidder_id: bidder_id,
      bid_amount: targetBid.bid_amount,
      compliance,
      warning
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
