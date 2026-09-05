const http = require('http');

function fetchReq(url, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method,
      headers: {}
    };
    if (body) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch(e) { json = data; }
        resolve({ status: res.statusCode, body: json });
      });
    });
    req.on('error', (err) => resolve({ status: 500, error: err.message }));
    if (body) req.write(body);
    req.end();
  });
}

async function testItem29() {
  console.log('=== ITEM 29: TESTING 404 & ERROR HANDLING FOR NON-EXISTENT IDS ===\n');

  const tests = [
    { name: 'GET /api/bidders/non-existent-123', method: 'GET', url: 'http://localhost:5000/api/bidders/non-existent-123' },
    { name: 'POST /api/bidders/non-existent-123/verify', method: 'POST', url: 'http://localhost:5000/api/bidders/non-existent-123/verify' },
    { name: 'GET /api/bidders/non-existent-123/compliance', method: 'GET', url: 'http://localhost:5000/api/bidders/non-existent-123/compliance' },
    { name: 'POST /api/bidders/non-existent-123/decision', method: 'POST', url: 'http://localhost:5000/api/bidders/non-existent-123/decision', body: JSON.stringify({ decision: 'Approved' }) },
    { name: 'GET /api/tenders/non-existent-123', method: 'GET', url: 'http://localhost:5000/api/tenders/non-existent-123' },
    { name: 'POST /api/tenders/non-existent-123/award', method: 'POST', url: 'http://localhost:5000/api/tenders/non-existent-123/award', body: JSON.stringify({ bidder_id: 'some-id' }) }
  ];

  for (const t of tests) {
    const res = await fetchReq(t.url, t.method, t.body);
    console.log(`${t.name} => HTTP ${res.status}: ${JSON.stringify(res.body)}`);
  }
}

testItem29();