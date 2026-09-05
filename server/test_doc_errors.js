const http = require('http');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDocumentErrors() {
  const bidder = await prisma.bidder.findFirst();
  console.log('=== ITEM 19: TESTING DOCUMENT UPLOAD VALIDATION & ERROR HANDLING ===\n');

  // 1. Missing doc_type
  console.log('Test 1: Uploading without doc_type...');
  const res1 = await new Promise(resolve => {
    const req = http.request(`http://localhost:5000/api/bidders/${bidder.bidder_id}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundaryXYZ'
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    // Send only file or empty
    req.write('------WebKitFormBoundaryXYZ\r\nContent-Disposition: form-data; name="file"; filename="dummy.txt"\r\nContent-Type: text/plain\r\n\r\nSample content\r\n------WebKitFormBoundaryXYZ--\r\n');
    req.end();
  });
  console.log(`  HTTP Status: ${res1.status}, Body: ${res1.body}`);

  // 2. Missing file
  console.log('\nTest 2: Uploading without file...');
  const res2 = await new Promise(resolve => {
    const req = http.request(`http://localhost:5000/api/bidders/${bidder.bidder_id}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundaryXYZ'
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.write('------WebKitFormBoundaryXYZ\r\nContent-Disposition: form-data; name="doc_type"\r\n\r\nGST_CERT\r\n------WebKitFormBoundaryXYZ--\r\n');
    req.end();
  });
  console.log(`  HTTP Status: ${res2.status}, Body: ${res2.body}`);
}

testDocumentErrors().then(() => prisma.$disconnect());