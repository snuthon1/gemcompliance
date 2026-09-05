const express = require('express');
const cors = require('cors');
const prisma = require('./db');

const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Ensure uploads folder exists and serve static uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Routes
const biddersRouter = require('./routes/bidders');
const mockPortalsRouter = require('./routes/mockPortals');
const tendersRouter = require('./routes/tenders');

app.use('/api/bidders', biddersRouter);
app.use('/api/tenders', tendersRouter);
app.use('/api', mockPortalsRouter);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const bidderCount = await prisma.bidder.count();
    const tenderCount = await prisma.tender.count();
    const bidCount = await prisma.bid.count();
    res.json({
      status: 'healthy',
      service: 'BidShield - GeM Bid Compliance Verification Platform (SIH26100)',
      database: process.env.TURSO_DATABASE_URL ? `Connected (Turso Cloud DB via libSQL: ${process.env.TURSO_DATABASE_URL})` : 'Connected (Local SQLite + Prisma)',
      seededBidders: bidderCount,
      seededTenders: tenderCount,
      seededBids: bidCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`BidShield Server running on http://localhost:${PORT}`);
  console.log(`Tenders API:    http://localhost:${PORT}/api/tenders`);
  console.log(`Bidders API:    http://localhost:${PORT}/api/bidders`);
  console.log(`=======================================================`);
});
