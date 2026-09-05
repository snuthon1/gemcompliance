const http = require('http');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function fetchGet(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch(e) { json = data; }
        resolve({ status: res.statusCode, body: json });
      });
    }).on('error', (err) => resolve({ status: 500, error: err.message }));
  });
}

async function runMockTests() {
  console.log('=== ITEM 5: TESTING ALL 4 MOCK PORTALS ACROSS ALL 5 BIDDERS ===\n');
  const bidders = await prisma.bidder.findMany();

  for (const b of bidders) {
    console.log(`>>> Testing Bidder: ${b.company_name}`);
    
    // 1. Udyam
    const udyamRes = await fetchGet(`http://localhost:5000/api/mock-udyam/verify?udyam_number=${encodeURIComponent(b.udyam_number)}`);
    console.log(`  UDYAM [${b.udyam_number}]: HTTP ${udyamRes.status} => status="${udyamRes.body?.data?.status}", category="${udyamRes.body?.data?.category}"`);

    // 2. GSTN
    const gstnRes = await fetchGet(`http://localhost:5000/api/mock-gstn/verify?gstin=${encodeURIComponent(b.gstin)}`);
    console.log(`  GSTN  [${b.gstin}]: HTTP ${gstnRes.status} => legal_name="${gstnRes.body?.data?.legal_name}", status="${gstnRes.body?.data?.status}", pending=${gstnRes.body?.data?.returns_pending}`);

    // 3. PAN
    const panRes = await fetchGet(`http://localhost:5000/api/mock-pan/verify?pan_number=${encodeURIComponent(b.pan_number)}`);
    console.log(`  PAN   [${b.pan_number}]: HTTP ${panRes.status} => itrFiled=${panRes.body?.data?.itr_filed_last_year}, compliance="${panRes.body?.data?.compliance_status}"`);

    // 4. Blacklist
    const blRes = await fetchGet(`http://localhost:5000/api/mock-blacklist/check?pan_or_gstin=${encodeURIComponent(b.gstin)}`);
    console.log(`  BLACKLIST [${b.gstin}]: HTTP ${blRes.status} => blacklisted=${blRes.body?.blacklisted} (reason: ${blRes.body?.details?.reason || 'None'})`);
    console.log('');
  }

  console.log('>>> Testing 404 / Invalid Inputs Handling:');
  const invUdyam = await fetchGet('http://localhost:5000/api/mock-udyam/verify?udyam_number=INVALID-UDYAM-999');
  console.log(`  Invalid Udyam: HTTP ${invUdyam.status} - message: "${invUdyam.body?.message}"`);

  const invGstn = await fetchGet('http://localhost:5000/api/mock-gstn/verify?gstin=INVALID-GSTN-999');
  console.log(`  Invalid GSTN:  HTTP ${invGstn.status} - message: "${invGstn.body?.message}"`);

  const invPan = await fetchGet('http://localhost:5000/api/mock-pan/verify?pan_number=INVALID-PAN-999');
  console.log(`  Invalid PAN:   HTTP ${invPan.status} - message: "${invPan.body?.message}"`);

  const invBl = await fetchGet('http://localhost:5000/api/mock-blacklist/check?pan_or_gstin=CLEAN-ENTITY-999');
  console.log(`  Invalid/Clean Blacklist: HTTP ${invBl.status} - blacklisted: ${invBl.body?.blacklisted}`);
}

runMockTests().then(() => prisma.$disconnect()).catch(err => { console.error(err); process.exit(1); });