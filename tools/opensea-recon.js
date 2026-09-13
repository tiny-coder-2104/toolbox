const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const SCREENSHOT_DIR = '/home/yuki/ai_works/pseudo_human/logs/navigator';
const OUTPUT_FILE = '/home/yuki/ai_works/pseudo_human/bug-bounty/notes/opensea-mutations-captured.md';

// Known hashes to avoid duplicates
const KNOWN_HASHES = new Set([
  'a61cfb87ef2335102f5f885dee334658f13e403696d3dc340267450340682f1e', // LinkedAccountsQuery
  'a8f0f7cff90c33f8e0a0faddf4747806a6dcb1d445463e33a0733f7cf53eb34f', // SettingsAccountProfileEditQuery
  '159702f9b2447942b17ca91172e017e840f61a93a4c03795566309cc2d77bce1', // SettingsAccountEmailQuery
  'acb06d8e0ed4e5cd09f62152f429bd7b987b0be05f17903d61686871a8382d78', // SettingsProfileUpdateMutation
  '136bc0abbafacfb3c9bd0bc3532c709cf51c8e4c33e9dddbe04e1bbf18018d04', // ProfileLayoutQuery
  '623774b3ce1f48ef154d2f34cc98ca0d00fe950bf37ad0f24761170800768ea2', // ProfileItemsCountQuery
  '8b45e422f5b8aa9f45f316b11b9362f05b7af87d88180e325c494b3860165e0e', // ProfileLinkedAddressesQuery
  'c21d7fe7e333865ed58f5f4143c7ef7e9f684309e0dea7a8ec7eb938df2bb11a', // ProfileItemsListQuery
  '28cc45304fcbe6df1ea3d79821cec1c14e4ffce9918b2521c1e57e60467dac60', // ProfileCollectionsListQuery
]);

async function main() {
  console.log('[+] Connecting to Chrome on port 9222...');
  
  // Connect to existing Chrome instance
  const browser = await chromium.connectOverCDP('http://[::1]:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages()[0] || await context.newPage();
  
  // Inject GraphQL capture script
  console.log('[+] Injecting GraphQL capture script...');
  await page.addInitScript(() => {
    window._capturedGraphQL = [];
    const origFetch = window.fetch;
    window.fetch = async function(...args) {
      const [url, opts] = args;
      if (typeof url === 'string' && url.includes('graphql')) {
        const entry = {
          url: url,
          method: opts?.method || 'GET',
          body: opts?.body ? opts.body.substring(0, 5000) : null,
          timestamp: Date.now()
        };
        // Extract operation name and persisted query hash from URL
        if (url.includes('operationName=')) {
          const match = url.match(/operationName=([^&]+)/);
          if (match) entry.operationName = decodeURIComponent(match[1]);
        }
        if (url.includes('sha256Hash')) {
          const match = url.match(/sha256Hash.*?%22([a-f0-9]{64})%22/);
          if (match) entry.sha256Hash = match[1];
        }
        // Also check POST body
        if (opts?.body) {
          try {
            const body = JSON.parse(opts.body);
            if (body.operationName) entry.operationName = body.operationName;
            if (body.variables) entry.variables = body.variables;
            if (body.extensions?.persistedQuery?.sha256Hash) entry.sha256Hash = body.extensions.persistedQuery.sha256Hash;
          } catch(e) {}
        }
        window._capturedGraphQL.push(entry);
        console.log('[GraphQL Captured]', entry);
      }
      return origFetch.apply(this, args);
    };
  });
  
  // Also listen for console messages
  page.on('console', msg => {
    if (msg.text().includes('[GraphQL Captured]')) {
      console.log('  Browser:', msg.text());
    }
  });
  
  // Pages to visit
  const pagesToVisit = [
    { url: 'https://opensea.io/tinycoderstudio', name: 'Profile page' },
    { url: 'https://opensea.io/account/settings', name: 'Settings page' },
    { url: 'https://opensea.io/explore', name: 'Explore/Marketplace' },
    { url: 'https://opensea.io/collection/boredapeyachtclub', name: 'Collection page (BAYC)' },
    { url: 'https://opensea.io/item/ethereum/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/1', name: 'Item page (BAYC #1)' },
    { url: 'https://opensea.io/activity', name: 'Activity feed' },
    { url: 'https://opensea.io/account/favorites', name: 'Favorites' },
    { url: 'https://opensea.io/account/notifications', name: 'Notifications' },
    { url: 'https://opensea.io/account/offers', name: 'Offers/Bids' },
    { url: 'https://opensea.io/account/listings', name: 'Listings' },
    { url: 'https://opensea.io/account/portfolio', name: 'Portfolio' },
  ];
  
  const allCaptured = [];
  
  for (const { url, name } of pagesToVisit) {
    console.log(`\n[+] Visiting: ${name} - ${url}`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(3000); // Wait for any lazy-loaded GraphQL
      
      // Scroll to trigger more loads
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1000);
      
      // Screenshot
      const screenshotPath = path.join(SCREENSHOT_DIR, `${TIMESTAMP}-opensea-${name.replace(/\s+/g, '-').toLowerCase()}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`  Screenshot: ${screenshotPath}`);
      
      // Extract captured GraphQL from this page
      const captured = await page.evaluate(() => window._capturedGraphQL || []);
      console.log(`  Captured ${captured.length} GraphQL requests`);
      allCaptured.push(...captured);
      
      // Also check for mutations in page source
      const mutationsInSource = await page.evaluate(() => {
        const scripts = document.querySelectorAll('script');
        const mutations = [];
        scripts.forEach(s => {
          if (s.textContent && s.textContent.includes('mutation')) {
            const matches = s.textContent.match(/mutation\s+\w+/g);
            if (matches) mutations.push(...matches);
          }
        });
        return [...new Set(mutations)];
      });
      if (mutationsInSource.length > 0) {
        console.log(`  Mutations in source: ${mutationsInSource.join(', ')}`);
      }
      
    } catch (e) {
      console.log(`  Error visiting ${url}: ${e.message}`);
      const screenshotPath = path.join(SCREENSHOT_DIR, `${TIMESTAMP}-opensea-${name.replace(/\s+/g, '-').toLowerCase()}-error.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
    }
  }
  
  // Get final captured data
  const finalCaptured = await page.evaluate(() => window._capturedGraphQL || []);
  console.log(`\n[+] Total captured: ${finalCaptured.length}`);
  
  // Filter for POST (mutations) and new hashes
  const postRequests = finalCaptured.filter(e => e.method === 'POST');
  const newMutations = [];
  const newQueries = [];
  
  for (const req of finalCaptured) {
    if (req.sha256Hash && !KNOWN_HASHES.has(req.sha256Hash)) {
      if (req.method === 'POST') {
        newMutations.push(req);
      } else {
        newQueries.push(req);
      }
      KNOWN_HASHES.add(req.sha256Hash);
    }
  }
  
  console.log(`[+] New mutations: ${newMutations.length}`);
  console.log(`[+] New queries: ${newQueries.length}`);
  
  // Write results to markdown
  const dateStr = new Date().toISOString().split('T')[0];
  let md = `# OpenSea Mutations Captured — ${dateStr}\n\n`;
  
  md += `## New Mutations Found\n`;
  md += `| # | Operation Name | Hash | Method | Variables (keys) | Notes |\n`;
  md += `|---|---------------|------|--------|-----------------|-------|\n`;
  
  newMutations.forEach((m, i) => {
    const varKeys = m.variables ? Object.keys(m.variables).join(', ') : 'none';
    const notes = m.url.includes('graphql') ? 'GraphQL endpoint' : '';
    md += `| ${i+1} | ${m.operationName || 'unknown'} | ${m.sha256Hash?.substring(0, 16)}... | ${m.method} | ${varKeys} | ${notes} |\n`;
  });
  
  if (newMutations.length === 0) {
    md += `| - | No new mutations captured | - | - | - | Try more interactions |\n`;
  }
  
  md += `\n## New Queries Found\n`;
  md += `| # | Operation Name | Hash | Method | Variables (keys) | Notes |\n`;
  md += `|---|---------------|------|--------|-----------------|-------|\n`;
  
  newQueries.forEach((q, i) => {
    const varKeys = q.variables ? Object.keys(q.variables).join(', ') : 'none';
    md += `| ${i+1} | ${q.operationName || 'unknown'} | ${q.sha256Hash?.substring(0, 16)}... | ${q.method} | ${varKeys} | |\n`;
  });
  
  if (newQueries.length === 0) {
    md += `| - | No new queries captured | - | - | - | |\n`;
  }
  
  md += `\n## Already Known (9 hashes)\n`;
  const knownList = [
    'LinkedAccountsQuery: a61cfb87ef2335102f5f885dee334658f13e403696d3dc340267450340682f1e',
    'SettingsAccountProfileEditQuery: a8f0f7cff90c33f8e0a0faddf4747806a6dcb1d445463e33a0733f7cf53eb34f',
    'SettingsAccountEmailQuery: 159702f9b2447942b17ca91172e017e840f61a93a4c03795566309cc2d77bce1',
    'SettingsProfileUpdateMutation: acb06d8e0ed4e5cd09f62152f429bd7b987b0be05f17903d61686871a8382d78',
    'ProfileLayoutQuery: 136bc0abbafacfb3c9bd0bc3532c709cf51c8e4c33e9dddbe04e1bbf18018d04',
    'ProfileItemsCountQuery: 623774b3ce1f48ef154d2f34cc98ca0d00fe950bf37ad0f24761170800768ea2',
    'ProfileLinkedAddressesQuery: 8b45e422f5b8aa9f45f316b11b9362f05b7af87d88180e325c494b3860165e0e',
    'ProfileItemsListQuery: c21d7fe7e333865ed58f5f4143c7ef7e9f684309e0dea7a8ec7eb938df2bb11a',
    'ProfileCollectionsListQuery: 28cc45304fcbe6df1ea3d79821cec1c14e4ffce9918b2521c1e57e60467dac60',
  ];
  knownList.forEach(k => md += `- ${k}\n`);
  
  md += `\n## All Captured Requests (Raw)\n`;
  md += '```json\n';
  md += JSON.stringify(finalCaptured, null, 2);
  md += '\n```\n';
  
  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(OUTPUT_FILE, md);
  console.log(`\n[+] Results written to: ${OUTPUT_FILE}`);
  
  // Print summary
  console.log('\n=== SUMMARY ===');
  console.log(`New mutations found: ${newMutations.length}`);
  console.log(`New queries found: ${newQueries.length}`);
  console.log(`Total requests captured: ${finalCaptured.length}`);
  
  if (newMutations.length > 0) {
    console.log('\nPromising mutations for IDOR testing:');
    newMutations.forEach(m => {
      const varKeys = m.variables ? Object.keys(m.variables) : [];
      const idVars = varKeys.filter(k => k.toLowerCase().includes('id') || k.toLowerCase().includes('account') || k.toLowerCase().includes('item') || k.toLowerCase().includes('collection') || k.toLowerCase().includes('offer') || k.toLowerCase().includes('listing'));
      if (idVars.length > 0) {
        console.log(`  - ${m.operationName} (${m.sha256Hash?.substring(0, 16)}...): accepts ${idVars.join(', ')}`);
      }
    });
  }
  
  await browser.close();
}

main().catch(console.error);
