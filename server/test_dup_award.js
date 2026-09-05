const http = require('http');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDuplicateAward() {
  const tender = await prisma.tender.findFirst({ where: { status: 'Awarded' } });
  const bidder = await prisma.bidder.findFirst();
  console.log(`Testing duplicate award against already-awarded tender: "${tender.title}" (${tender.tender_id})`);

  const payload = JSON.stringify({ bidder_id: bidder.bidder_id });
  const req = http.request(`http://localhost:5000/api/tenders/${tender.tender_id}/award`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`HTTP Status: ${res.statusCode}`);
      console.log(`Response Body: ${data}`);
    });
  });
  req.write(payload);
  req.end();
}

testDuplicateAward().then(() => prisma.$disconnect());