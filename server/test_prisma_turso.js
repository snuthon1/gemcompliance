const prisma = require('./db');
async function test() {
  const count = await prisma.bidder.count();
  console.log('PRISMA CONNECTED TO TURSO CLOUD DB! Total Bidders:', count);
  const bidders = await prisma.bidder.findMany({ select: { company_name: true, gstin: true } });
  console.log('Sample bidder from Turso:', bidders[0]);
  const tenderCount = await prisma.tender.count();
  console.log('Total Tenders on Turso:', tenderCount);
}
test().then(() => prisma.$disconnect()).catch(e => console.error(e));