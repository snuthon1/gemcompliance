const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
  console.log('=== ITEM 1: MODEL CHECK ===');
  const models = ['bidder', 'udyamRegistry', 'gstnRegistry', 'panRegistry', 'blacklistRegistry', 'document', 'verificationResult', 'auditLog', 'tender', 'bid'];
  for (const m of models) {
    if (typeof prisma[m]?.count === 'function') {
      const c = await prisma[m].count();
      console.log(`Model ${m}: EXISTS (${c} rows)`);
    } else {
      console.error(`Model ${m}: MISSING!`);
    }
  }

  console.log('\n=== ITEM 2 & 3: BIDDERS & REGISTRY CONSISTENCY ===');
  const bidders = await prisma.bidder.findMany();
  console.log(`Total seeded bidders: ${bidders.length}`);
  for (const b of bidders) {
    const udyam = await prisma.udyamRegistry.findUnique({ where: { udyam_number: b.udyam_number } });
    const gstn = await prisma.gstnRegistry.findUnique({ where: { gstin: b.gstin } });
    const pan = await prisma.panRegistry.findUnique({ where: { pan_number: b.pan_number } });
    const bl = await prisma.blacklistRegistry.findFirst({ where: { pan_or_gstin: b.gstin } });
    const isPanConsistent = pan?.itr_filed_last_year === (pan?.compliance_status === 'Compliant');
    console.log(`--- ${b.company_name} (${b.bidder_id}) ---`);
    console.log(`  Udyam: status=${udyam?.status}, cat=${udyam?.category}`);
    console.log(`  GSTN:  legal_name="${gstn?.legal_name}", status=${gstn?.status}, pending=${gstn?.returns_pending}`);
    console.log(`  PAN:   itr_filed=${pan?.itr_filed_last_year}, status=${pan?.compliance_status} (LOGICALLY CONSISTENT? ${isPanConsistent})`);
    console.log(`  Blacklist: ${bl?.blacklisted ? `BLACKLISTED (${bl?.reason})` : 'Clean'}`);
  }

  console.log('\n=== ITEM 4: TENDERS & BIDS ===');
  const tenders = await prisma.tender.findMany();
  console.log(`Total tenders: ${tenders.length}`);
  for (const t of tenders) {
    const bids = await prisma.bid.findMany({ where: { tender_id: t.tender_id } });
    console.log(`Tender: "${t.title}" (${t.status}) - ${bids.length} bids`);
    for (const bid of bids) {
      const bObj = bidders.find(x => x.bidder_id === bid.bidder_id);
      console.log(`   Bid ${bid.bid_id}: ${bObj?.company_name} => Rs.${bid.bid_amount} (${bid.status})`);
    }
  }
}

checkDb().then(() => prisma.$disconnect()).catch(err => { console.error(err); process.exit(1); });