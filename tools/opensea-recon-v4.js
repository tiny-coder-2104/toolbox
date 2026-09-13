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
  'a42c430444701592ba32f808bcb62a18a8224e8223f60bbaa270865fc4edff09', // WalletProfileStatsQuery
]);

// Store all captures in Node.js memory (persists across navigations)
let allCaptured = [];

function extractGraphQLInfo(params) {
  const request = params.request;
  const url = request.url;
  if (!url.includes('graphql')) return null;
  
  const entry = {
    url: url,
    method: request.method,
    body: request.postData ? request.postData.substring(0, 5000) : null,
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
  if (request.postData) {
    try {
      const body = JSON.parse(request.postData);
      if (body.operationName) entry.operationName = body.operationName;
      if (body.variables) entry.variables = body.variables;
      if (body.extensions?.persistedQuery?.sha256Hash) entry.sha256Hash = body.extensions.persistedQuery.sha256Hash;
    } catch(e) {}
  }
  
  return entry;
}

async function main() {
  console.log('[+] Connecting to Chrome on port 9222...');
  
  const browser = await chromium.connectOverCDP('http://[::1]:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages()[0] || await context.newPage();
  
  // Set up CDP network interception - this persists across navigations!
  const client = await context.newCDPSession(page);
  await client.send('Network.enable');
  
  client.on('Network.requestWillBeSent', (params) => {
    const entry = extractGraphQLInfo(params);
    if (entry) {
      allCaptured.push(entry);
      console.log('[GraphQL Captured]', JSON.stringify(entry).substring(0, 200));
    }
  });
  
  // Helper to visit and capture
  async function visitAndCapture(url, name, interactFn = null) {
    console.log(`\n[+] Visiting: ${name} - ${url}`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(3000);
      
      // Scroll to trigger lazy loads
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1000);
      
      // Run interaction function if provided
      if (interactFn) {
        await interactFn(page);
        await page.waitForTimeout(3000);
      }
      
      // Screenshot
      const safeName = name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const screenshotPath = path.join(SCREENSHOT_DIR, `${TIMESTAMP}-opensea-${safeName}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`  Screenshot: ${screenshotPath}`);
      
      console.log(`  Total captured so far: ${allCaptured.length}`);
      
    } catch (e) {
      console.log(`  Error visiting ${url}: ${e.message}`);
      const safeName = name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const screenshotPath = path.join(SCREENSHOT_DIR, `${TIMESTAMP}-opensea-${safeName}-error.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
    }
  }
  
  // ===== PHASE 1: Passive browsing (queries) =====
  await visitAndCapture('https://opensea.io/tinycoderstudio', 'Profile page');
  await visitAndCapture('https://opensea.io/account/settings', 'Settings page');
  await visitAndCapture('https://opensea.io/explore', 'Explore/Marketplace');
  await visitAndCapture('https://opensea.io/collection/boredapeyachtclub', 'Collection page (BAYC)');
  await visitAndCapture('https://opensea.io/item/ethereum/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/1', 'Item page (BAYC #1)');
  await visitAndCapture('https://opensea.io/activity', 'Activity feed');
  await visitAndCapture('https://opensea.io/account/favorites', 'Favorites');
  await visitAndCapture('https://opensea.io/account/notifications', 'Notifications');
  await visitAndCapture('https://opensea.io/account/offers', 'Offers/Bids');
  await visitAndCapture('https://opensea.io/account/listings', 'Listings');
  await visitAndCapture('https://opensea.io/account/portfolio', 'Portfolio');
  
  // ===== PHASE 2: Active interactions to trigger mutations =====
  console.log('\n=== PHASE 2: Active Interactions ===');
  
  // Try to trigger mutations on item page (make offer, add to watchlist, etc.)
  await visitAndCapture('https://opensea.io/item/ethereum/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/1', 'Item page - interact', async (page) => {
    console.log('  Trying to click "Make Offer" button...');
    try {
      const makeOfferBtn = page.locator('button:has-text("Make offer"), button:has-text("Make Offer"), [data-testid="make-offer-button"]').first();
      if (await makeOfferBtn.count() > 0) {
        await makeOfferBtn.click();
        await page.waitForTimeout(2000);
        console.log('  Clicked Make Offer');
        
        const amountInput = page.locator('input[name="amount"], input[placeholder*="amount" i], input[placeholder*="Amount" i]').first();
        if (await amountInput.count() > 0) {
          await amountInput.fill('0.01');
          await page.waitForTimeout(1000);
          console.log('  Filled offer amount');
        }
        
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      } else {
        console.log('  Make Offer button not found');
      }
    } catch (e) {
      console.log('  Interaction error:', e.message);
    }
  });
  
  // Try settings page interactions
  await visitAndCapture('https://opensea.io/account/settings', 'Settings page - interact', async (page) => {
    console.log('  Trying to interact with settings...');
    try {
      const saveBtn = page.locator('button:has-text("Save"), button:has-text("Update"), button[type="submit"]').first();
      if (await saveBtn.count() > 0) {
        await saveBtn.hover();
        await page.waitForTimeout(1000);
        console.log('  Hovered save button');
      }
      
      const inputs = page.locator('input, textarea, select');
      const count = await inputs.count();
      for (let i = 0; i < Math.min(count, 5); i++) {
        await inputs.nth(i).hover();
        await page.waitForTimeout(200);
      }
    } catch (e) {
      console.log('  Interaction error:', e.message);
    }
  });
  
  // Try collection page interactions
  await visitAndCapture('https://opensea.io/collection/boredapeyachtclub', 'Collection page - interact', async (page) => {
    console.log('  Trying collection interactions...');
    try {
      const firstItem = page.locator('[data-testid="collection-item"], .AssetCard, a[href*="/item/"]').first();
      if (await firstItem.count() > 0) {
        await firstItem.click();
        await page.waitForTimeout(3000);
        console.log('  Clicked first item');
        
        const makeOfferBtn = page.locator('button:has-text("Make offer"), button:has-text("Make Offer")').first();
        if (await makeOfferBtn.count() > 0) {
          await makeOfferBtn.click();
          await page.waitForTimeout(2000);
          await page.keyboard.press('Escape');
          await page.waitForTimeout(1000);
        }
      }
    } catch (e) {
      console.log('  Interaction error:', e.message);
    }
  });
  
  // Try explore page with search/filter interactions
  await visitAndCapture('https://opensea.io/explore', 'Explore - interact', async (page) => {
    console.log('  Trying explore interactions...');
    try {
      const collectionLink = page.locator('a[href*="/collection/"]').first();
      if (await collectionLink.count() > 0) {
        await collectionLink.click();
        await page.waitForTimeout(3000);
        console.log('  Clicked collection link');
      }
    } catch (e) {
      console.log('  Interaction error:', e.message);
    }
  });
  
  // Try profile page interactions (edit profile)
  await visitAndCapture('https://opensea.io/tinycoderstudio', 'Profile page - interact', async (page) => {
    console.log('  Trying profile interactions...');
    try {
      const editBtn = page.locator('button:has-text("Edit"), a:has-text("Edit profile"), [data-testid="edit-profile"]').first();
      if (await editBtn.count() > 0) {
        await editBtn.click();
        await page.waitForTimeout(3000);
        console.log('  Clicked edit profile');
        
        const bioInput = page.locator('textarea[name="bio"], textarea[placeholder*="bio" i]').first();
        if (await bioInput.count() > 0) {
          await bioInput.hover();
          await page.waitForTimeout(500);
        }
        
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      console.log('  Interaction error:', e.message);
    }
  });
  
  // ===== PHASE 3: Check page source for mutation definitions =====
  console.log('\n=== PHASE 3: Checking page source for mutations ===');
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
  console.log(`Mutations in source: ${mutationsInSource.join(', ') || 'none'}`);
  
  console.log(`\n[+] Total captured: ${allCaptured.length}`);
  
  // Filter for POST (mutations) and new hashes
  const postRequests = allCaptured.filter(e => e.method === 'POST');
  const newMutations = [];
  const newQueries = [];
  
  for (const req of allCaptured) {
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
  console.log(`[+] POST requests: ${postRequests.length}`);
  
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
  
  md += `\n## Mutations Found in Page Source\n`;
  if (mutationsInSource.length > 0) {
    mutationsInSource.forEach(m => md += `- ${m}\n`);
  } else {
    md += `None found\n`;
  }
  
  md += `\n## Already Known (${KNOWN_HASHES.size} hashes)\n`;
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
    'WalletProfileStatsQuery: a42c430444701592ba32f808bcb62a18a8224e8223f60bbaa270865fc4edff09',
  ];
  knownList.forEach(k => md += `- ${k}\n`);
  
  md += `\n## All Captured Requests (Raw)\n`;
  md += '```json\n';
  md += JSON.stringify(allCaptured, null, 2);
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
  console.log(`Total requests captured: ${allCaptured.length}`);
  console.log(`POST requests (mutations): ${postRequests.length}`);
  
  if (newMutations.length > 0) {
    console.log('\nPromising mutations for IDOR testing:');
    newMutations.forEach(m => {
      const varKeys = m.variables ? Object.keys(m.variables) : [];
      const idVars = varKeys.filter(k => k.toLowerCase().includes('id') || k.toLowerCase().includes('account') || k.toLowerCase().includes('item') || k.toLowerCase().includes('collection') || k.toLowerCase().includes('offer') || k.toLowerCase().includes('listing') || k.toLowerCase().includes('asset') || k.toLowerCase().includes('token'));
      if (idVars.length > 0) {
        console.log(`  - ${m.operationName} (${m.sha256Hash?.substring(0, 16)}...): accepts ${idVars.join(', ')}`);
      }
    });
  }
  
  if (postRequests.length > 0) {
    console.log('\nAll POST requests captured:');
    postRequests.forEach(r => {
      console.log(`  - ${r.operationName || 'unknown'} (${r.sha256Hash?.substring(0, 16)}...): ${r.variables ? Object.keys(r.variables).join(', ') : 'no vars'}`);
    });
  }
  
  await browser.close();
}

main().catch(console.error);
