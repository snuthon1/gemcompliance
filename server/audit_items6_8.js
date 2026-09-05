const http = require('http');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function fetchPost(url) {
  return new Promise((resolve) => {
    const req = http.request(url, { method: 'POST' }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch(e) { json = data; }
        resolve({ status: res.statusCode, body: json });
      });
    });
    req.on('error', (err) => resolve({ status: 500, error: err.message }));
    req.end();
  });
}

async function runVerificationAudit() {
  console.log('=== ITEMS 6, 7, 8: VERIFYING ALL 5 BIDDERS FRESH ===\n');
  const bidders = await prisma.bidder.findMany();

  const expected = {
    'Apex Petrochem Engineering Pvt Ltd': { score: 100, risk: 'Low', rec: 'Compliant' },
    'Coromandel Heavy Valves & Alloy Works Ltd': { score: 0, risk: 'High', rec: 'Non-Compliant' },
    'Bharat High-Pressure Seamless Pipes Pvt Ltd': { score: 85, risk: 'Medium', rec: 'Needs Clarification' },
    'Kaveri Refining Spares & Services Ltd': { score: 45, risk: 'High', rec: 'Non-Compliant' },
    'Deccan Petro Instrumentation & Flow Systems': { score: 90, risk: 'Low', rec: 'Compliant' }
  };

  let allPassed = true;

  for (const b of bidders) {
    const res = await fetchPost(`http://localhost:5000/api/bidders/${b.bidder_id}/verify`);
    const exp = expected[b.company_name];
    const actualScore = res.body?.score;
    const actualRisk = res.body?.risk;
    const actualRec = res.body?.recommendation;

    const matches = actualScore === exp.score && actualRisk === exp.risk && actualRec === exp.rec;
    if (!matches) allPassed = false;

    console.log(`Bidder: ${b.company_name}`);
    console.log(`  Expected: score=${exp.score}, risk=${exp.risk}, rec=${exp.rec}`);
    console.log(`  Actual:   score=${actualScore}, risk=${actualRisk}, rec=${actualRec} => [${matches ? 'PASS' : 'FAIL'}]`);
    console.log(`  Flags (${res.body?.flags?.length || 0}): ${JSON.stringify(res.body?.flags)}`);
    console.log('');
  }

  console.log(`OVERALL ITEM 6 RESULT: ${allPassed ? 'ALL 5 MATCH EXACT SPEC' : 'CRITICAL BUG DETECTED'}`);

  // Item 7: Test NAME_MATCH override check directly in scoringEngine
  console.log('\n=== ITEM 7: TESTING NAME_MATCH OVERRIDE RULE ===');
  const { calculateScore } = require('./services/scoringEngine');
  // Scenario: 5 checks pass (UDYAM 15, GST_STATUS 15, GST_RETURNS 15, PAN 10, BLACKLIST 20), NAME_MATCH fails (15).
  // Raw score is 100 - 15 = 85. Without override, 85 is Low risk / Compliant.
  // With override, it MUST be downgraded to Medium / Needs Clarification.
  const nameMismatchCheck = [
    { check_type: 'UDYAM_STATUS', match_status: 'Match' },
    { check_type: 'GST_STATUS', match_status: 'Match' },
    { check_type: 'GST_RETURNS', match_status: 'Match' },
    { check_type: 'PAN_COMPLIANCE', match_status: 'Match' },
    { check_type: 'BLACKLIST_CHECK', match_status: 'Match' },
    { check_type: 'NAME_MATCH', match_status: 'Mismatch' }
  ];
  const nameEval = calculateScore(nameMismatchCheck);
  console.log(`NAME_MATCH Mismatch Test: Score=${nameEval.score}, Risk=${nameEval.risk}, Rec=${nameEval.recommendation}`);
  console.log(`Downgraded from Low to Medium? ${nameEval.risk === 'Medium' && nameEval.recommendation === 'Needs Clarification' ? 'PASS' : 'FAIL'}`);

  // Item 8: Test BLACKLIST hard override check
  console.log('\n=== ITEM 8: TESTING BLACKLIST HARD OVERRIDE (SCORE = 0) ===');
  const blacklistFailCheck = [
    { check_type: 'UDYAM_STATUS', match_status: 'Match' },
    { check_type: 'GST_STATUS', match_status: 'Match' },
    { check_type: 'GST_RETURNS', match_status: 'Match' },
    { check_type: 'PAN_COMPLIANCE', match_status: 'Match' },
    { check_type: 'BLACKLIST_CHECK', match_status: 'Mismatch' },
    { check_type: 'NAME_MATCH', match_status: 'Match' }
  ];
  const blEval = calculateScore(blacklistFailCheck);
  console.log(`Blacklist Mismatch Test: Score=${blEval.score}, Risk=${blEval.risk}, Rec=${blEval.recommendation}`);
  console.log(`Hard override to 0 / High / Non-Compliant? ${blEval.score === 0 && blEval.risk === 'High' && blEval.recommendation === 'Non-Compliant' ? 'PASS' : 'FAIL'}`);
}

runVerificationAudit().then(() => prisma.$disconnect()).catch(err => { console.error(err); process.exit(1); });