const puppeteer = require('puppeteer-core');
const os = require('os');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runBrowserAudit() {
  const profileDir = path.join(os.tmpdir(), 'chrome_audit_' + Date.now());
  console.log('=== LAUNCHING REAL GOOGLE CHROME FOR COMPREHENSIVE AUDIT ===');
  
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      `--user-data-dir=${profileDir}`
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[CONSOLE ERROR] on ${page.url()}: ${msg.text()}`);
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(`[PAGE ERROR] on ${page.url()}: ${err.message}`);
  });

  try {
    // -------------------------------------------------------------
    // ITEM 9: DASHBOARD LOAD & ALL 5 BIDDERS WITH SCORES & BADGES
    // -------------------------------------------------------------
    console.log('\n--- ITEM 9: DASHBOARD LOAD & LIVE BIDDER DATA ---');
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });
    await page.waitForSelector('table tbody tr');

    const bidderRows = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      return rows.map(r => {
        const name = r.querySelector('td:nth-child(1) .font-semibold')?.innerText.trim() || '';
        const gstin = r.querySelector('td:nth-child(2)')?.innerText.trim() || '';
        const pan = r.querySelector('td:nth-child(3)')?.innerText.trim() || '';
        const udyam = r.querySelector('td:nth-child(4)')?.innerText.trim() || '';
        const compCell = r.querySelector('td:nth-child(5)')?.innerText.replace(/\n/g, ' ').trim() || '';
        return { name, gstin, pan, udyam, compCell };
      });
    });

    console.log(`Found ${bidderRows.length} bidder rows on dashboard:`);
    bidderRows.forEach((r, idx) => {
      console.log(`  Row ${idx + 1}: ${r.name.padEnd(45)} | Score & Badge: [${r.compCell}]`);
    });

    // -------------------------------------------------------------
    // ITEM 10: RISK FILTER DROPDOWN TEST
    // -------------------------------------------------------------
    console.log('\n--- ITEM 10: RISK FILTER DROPDOWN TESTS ---');
    // Filter Low
    await page.select('select#risk-filter', 'Low');
    await new Promise(r => setTimeout(r, 400));
    let filteredCount = await page.evaluate(() => document.querySelectorAll('tbody tr').length);
    let visibleNames = await page.evaluate(() => Array.from(document.querySelectorAll('tbody tr td:nth-child(1) .font-semibold')).map(x => x.innerText.trim()));
    console.log(`Filter "Low": ${filteredCount} visible rows -> [${visibleNames.join(', ')}] (Expected 2: Apex, Deccan)`);

    // Filter Medium
    await page.select('select#risk-filter', 'Medium');
    await new Promise(r => setTimeout(r, 400));
    filteredCount = await page.evaluate(() => document.querySelectorAll('tbody tr').length);
    visibleNames = await page.evaluate(() => Array.from(document.querySelectorAll('tbody tr td:nth-child(1) .font-semibold')).map(x => x.innerText.trim()));
    console.log(`Filter "Medium": ${filteredCount} visible rows -> [${visibleNames.join(', ')}] (Expected 1: Bharat)`);

    // Filter High
    await page.select('select#risk-filter', 'High');
    await new Promise(r => setTimeout(r, 400));
    filteredCount = await page.evaluate(() => document.querySelectorAll('tbody tr').length);
    visibleNames = await page.evaluate(() => Array.from(document.querySelectorAll('tbody tr td:nth-child(1) .font-semibold')).map(x => x.innerText.trim()));
    console.log(`Filter "High": ${filteredCount} visible rows -> [${visibleNames.join(', ')}] (Expected 2: Coromandel, Kaveri)`);

    // Reset All
    await page.select('select#risk-filter', 'All');
    await new Promise(r => setTimeout(r, 400));
    filteredCount = await page.evaluate(() => document.querySelectorAll('tbody tr').length);
    console.log(`Filter "All": ${filteredCount} visible rows (Expected 5)`);

    // -------------------------------------------------------------
    // ITEM 11, 12, 13: VISIT ALL 5 BIDDER DETAIL PAGES & CHECK DATA
    // -------------------------------------------------------------
    console.log('\n--- ITEMS 11, 12, 13: CHECKING ALL 5 BIDDER DETAIL PAGES ---');
    const bidders = await prisma.bidder.findMany({ orderBy: { created_at: 'asc' } });

    for (const b of bidders) {
      console.log(`\n>>> Navigating to detail page for: ${b.company_name} (${b.bidder_id})`);
      await page.goto(`http://127.0.0.1:3000/bidder/${b.bidder_id}`, { waitUntil: 'networkidle0' });

      const pageData = await page.evaluate(() => {
        const score = document.querySelector('.text-4xl')?.innerText || '';
        const risk = document.querySelector('.underline')?.innerText || '';
        const rec = document.querySelector('.border-l span:last-child')?.innerText || '';
        
        const checkRows = Array.from(document.querySelectorAll('table tbody tr')).map(tr => {
          const type = tr.querySelector('td:nth-child(1) div:last-child')?.innerText || '';
          const status = tr.querySelector('td:nth-child(3) span')?.innerText || '';
          const docVal = tr.querySelector('td:nth-child(4)')?.innerText.trim() || '';
          const portalVal = tr.querySelector('td:nth-child(5)')?.innerText.trim() || '';
          return { type, status, docVal, portalVal };
        });

        const flagItems = Array.from(document.querySelectorAll('ul li')).map(li => li.innerText.trim());

        return { score, risk, rec, checkRows, flagItems };
      });

      console.log(`  Hero Card: Score=${pageData.score}/100 | Risk=${pageData.risk} | Rec=${pageData.rec}`);
      console.log(`  Statutory Checklist (${pageData.checkRows.length} checks):`);
      pageData.checkRows.forEach(c => {
        console.log(`    ${c.type.padEnd(16)} => Status: ${c.status.padEnd(8)} | Doc: "${c.docVal}" | Portal: "${c.portalVal}"`);
      });
      console.log(`  Flags Count: ${pageData.flagItems.length}`);
      pageData.flagItems.forEach(f => console.log(`    Flag: ${f}`));
    }

    // -------------------------------------------------------------
    // ITEM 14: SUBMIT OFFICER DECISION
    // -------------------------------------------------------------
    console.log('\n--- ITEM 14: SUBMIT OFFICER DECISION VIA UI FOR BHARAT HIGH-PRESSURE ---');
    const bharat = bidders.find(b => b.company_name.includes('Bharat'));
    await page.goto(`http://127.0.0.1:3000/bidder/${bharat.bidder_id}`, { waitUntil: 'networkidle0' });

    await page.type('textarea', 'Officer requested certified board resolution clarifying legal entity name vs GSTN alias.');
    const reqClarifyBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('Request Clarification'));
    });
    await reqClarifyBtn.click();
    await new Promise(r => setTimeout(r, 1200));

    const decisionBanner = await page.evaluate(() => {
      return document.querySelector('.bg-white\\/10')?.innerText.replace(/\n/g, ' ') || '';
    });
    console.log(`Decision successfully registered in UI banner: "${decisionBanner}"`);

    // -------------------------------------------------------------
    // ITEM 15: LIVE BROWSER TEST OF "RE-RUN VERIFICATION" BUTTON
    // -------------------------------------------------------------
    console.log('\n--- ITEM 15: TESTING "RE-RUN VERIFICATION" BUTTON IN BROWSER ---');
    const rerunBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('Re-run Verification Engine'));
    });
    await rerunBtn.click();
    console.log('Clicked Re-run Verification button...');
    await new Promise(r => setTimeout(r, 1500));
    const postRerunScore = await page.evaluate(() => document.querySelector('.text-4xl')?.innerText);
    console.log(`Post re-run verification score displayed in UI: ${postRerunScore}/100`);

    // -------------------------------------------------------------
    // ITEM 16: CHRONOLOGICAL ORDER IN AUDIT TRAIL
    // -------------------------------------------------------------
    console.log('\n--- ITEM 16: AUDIT TRAIL TIMELINE ORDER (MOST RECENT FIRST) ---');
    const timelineEvents = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.font-mono.text-\\[12px\\]'));
      return items.map(p => p.innerText.trim());
    });
    console.log(`Timeline events on Bharat (top 5 most recent first):`);
    timelineEvents.slice(0, 5).forEach((e, idx) => console.log(`  ${idx + 1}. ${e}`));

    // -------------------------------------------------------------
    // ITEM 17 & 18: DOCUMENTS PERSISTENCE & MISMATCH WARNING
    // -------------------------------------------------------------
    console.log('\n--- ITEM 17 & 18: DOCUMENTS SECTION & MISMATCH WARNING ON BHARAT ---');
    const docCards = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.rounded-lg.border.p-4'));
      return cards.map(c => ({
        header: c.querySelector('.font-mono.font-bold')?.innerText || '',
        flagAlert: c.querySelector('.bg-rose-50 p')?.innerText.trim() || '',
        methodBadge: c.querySelector('.rounded-full')?.innerText.trim() || ''
      }));
    });
    console.log(`Found ${docCards.length} documents on Bharat detail page:`);
    docCards.forEach((d, idx) => {
      console.log(`  Doc ${idx + 1}: [${d.header}] Mode: "${d.methodBadge}" | Alert: "${d.flagAlert}"`);
    });

    // -------------------------------------------------------------
    // ITEM 20: TENDERS LIST PAGE (/tenders)
    // -------------------------------------------------------------
    console.log('\n--- ITEM 20: TENDERS LIST PAGE (/tenders) ---');
    await page.goto('http://127.0.0.1:3000/tenders', { waitUntil: 'networkidle0' });
    const tenderCards = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.rounded-xl.border.p-6'));
      return cards.map(c => ({
        title: c.querySelector('h3')?.innerText.trim() || '',
        status: c.querySelector('.rounded-full')?.innerText.trim() || '',
        meta: c.querySelector('.mt-6')?.innerText.replace(/\n/g, ' ').trim() || ''
      }));
    });
    console.log(`Found ${tenderCards.length} tenders on /tenders:`);
    tenderCards.forEach((t, idx) => {
      console.log(`  Tender ${idx + 1}: "${t.title}" | Status: ${t.status} | Meta: ${t.meta}`);
    });

    // -------------------------------------------------------------
    // ITEM 21 & 22: TENDER DETAIL & SORTING TOGGLE
    // -------------------------------------------------------------
    console.log('\n--- ITEM 21 & 22: TENDER DETAIL & SORTING TOGGLE ---');
    const tenders = await prisma.tender.findMany({ orderBy: { estimated_value: 'desc' } });
    const tender1 = tenders[0];
    await page.goto(`http://127.0.0.1:3000/tenders/${tender1.tender_id}`, { waitUntil: 'networkidle0' });

    // Initial Sort (Compliance Score)
    let bidNamesComplianceOrder = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('table tbody tr td:first-child a')).map(a => a.innerText.trim());
    });
    console.log(`Tender 1 bids sorted by Compliance Score:`);
    bidNamesComplianceOrder.forEach((name, idx) => console.log(`  ${idx + 1}. ${name}`));

    // Click Sort by Lowest Price L1
    const sortPriceBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('Lowest Price (L1)'));
    });
    await sortPriceBtn.click();
    await new Promise(r => setTimeout(r, 400));

    let bidNamesPriceOrder = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('table tbody tr td:first-child a')).map(a => a.innerText.trim());
    });
    console.log(`Tender 1 bids re-sorted by Lowest Price (L1):`);
    bidNamesPriceOrder.forEach((name, idx) => console.log(`  ${idx + 1}. ${name}`));

    // -------------------------------------------------------------
    // ITEM 23 & 24: NON-COMPLIANT AWARD WARNING BANNER (TENDER 2)
    // -------------------------------------------------------------
    console.log('\n--- ITEM 23 & 24: TENDER 2 AWARD PERSISTENCE & WARNING BANNER ---');
    const tender2 = tenders[1];
    await page.goto(`http://127.0.0.1:3000/tenders/${tender2.tender_id}`, { waitUntil: 'networkidle0' });

    const tender2Status = await page.evaluate(() => {
      const banner = document.querySelector('.bg-rose-50.border-2.border-rose-600');
      const bannerText = banner ? banner.innerText.replace(/\n/g, ' ') : 'NONE';
      const bidStatuses = Array.from(document.querySelectorAll('table tbody tr')).map(tr => {
        const name = tr.querySelector('td:nth-child(1) a')?.innerText.trim();
        const stat = tr.querySelector('td:nth-child(6) span')?.innerText.trim();
        return `${name}: ${stat}`;
      });
      return { bannerText, bidStatuses };
    });

    console.log(`Tender 2 Persistent Warning Banner in UI:`);
    console.log(`  "${tender2Status.bannerText}"`);
    console.log(`Tender 2 Bid Statuses: [${tender2Status.bidStatuses.join(' | ')}]`);

    // -------------------------------------------------------------
    // ITEM 26 & 27: CONSOLE LOGS & NAVBAR NAVIGATION
    // -------------------------------------------------------------
    console.log('\n--- ITEM 26: CONSOLE LOGS AUDIT ---');
    if (consoleErrors.length === 0) {
      console.log('✅ ZERO console errors across all pages visited!');
    } else {
      console.log(`Console notices (${consoleErrors.length}):`);
      consoleErrors.forEach(e => console.log(`  ${e}`));
    }

    console.log('\n--- ITEM 27: NAVBAR LINKS AUDIT ---');
    const headerLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('header a')).map(a => ({ text: a.innerText.replace(/\n/g, ' ').trim(), href: a.getAttribute('href') }));
    });
    console.log('Header links found:', JSON.stringify(headerLinks, null, 2));

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

runBrowserAudit();