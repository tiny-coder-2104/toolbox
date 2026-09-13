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
  'c0613d136da337ea1d393c63655c7569b60ee81ac4b3fd19008b24dffc7c560d', // ItemActionsQuery
  '4ff18ba65ce77ce1d817fb5472eb0653aa8f95d3c712ce1db8de5ba7f7f1e40a', // ItemAttributesQuery
  '95256318b087cb37e4bbe1a5d9787f92ba455f455f3f2b488fce0b5c6cb39701', // ToolsDirectoryQuery
  'e90cce9fffa40ca0c9e7b35e52dad7891b88f2b16034ecf8262a18379839882a', // CollectionItemsCountQuery
  '3081f1bc87c81c1517fb8551df8c1e5cc771330c00973b01cdce1a20ad7a937b', // ItemViewModalQuery
  '5bcd4a62659fa27da2b62e0bf96795f9c18b6840be751ed5b4ee266c745f0b86', // TradingCardGroupSlugsQuery
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
  
  // Set up CDP network interception
  const client = await context.newCDPSession(page);
  await client.send('Network.enable');
  
  client.on('Network.requestWillBeSent', (params) => {
    const entry = extractGraphQLInfo(params);
    if (entry) {
      allCaptured.push(entry);
      console.log('[GraphQL Captured]', JSON.stringify(entry).substring(0, 200));
    }
  });
  
  // Visit settings/profile page and try to trigger SettingsProfileUpdateMutation
  console.log('\n[+] Visiting settings/profile page...');
  await page.goto('https://opensea.io/settings/profile', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);
  
  // Search for mutation definitions in all scripts
  console.log('\n=== Searching for mutation definitions in page source ===');
  const mutationDefs = await page.evaluate(() => {
    const scripts = document.querySelectorAll('script');
    const results = {
      mutations: [],
      mutationHashes: [],
      graphqlStrings: []
    };
    
    scripts.forEach(s => {
      if (s.textContent) {
        // Find mutation definitions
        const mutationMatches = s.textContent.match(/mutation\s+\w+/g);
        if (mutationMatches) {
          results.mutations.push(...mutationMatches);
        }
        
        // Find persisted query hashes
        const hashMatches = s.textContent.match(/sha256Hash["\s:=]+["']([a-f0-9]{64})["']/g);
        if (hashMatches) {
          results.mutationHashes.push(...hashMatches);
        }
        
        // Find GraphQL operation strings
        const gqlMatches = s.textContent.match(/(query|mutation)\s+\w+[\s\S]{0,200}/g);
        if (gqlMatches) {
          results.graphqlStrings.push(...gqlMatches);
        }
      }
    });
    
    return {
      mutations: [...new Set(results.mutations)],
      mutationHashes: [...new Set(results.mutationHashes)],
      graphqlStrings: [...new Set(results.graphqlStrings)].slice(0, 20)
    };
  });
  
  console.log('Mutations found:', mutationDefs.mutations);
  console.log('Hashes found:', mutationDefs.mutationHashes);
  console.log('GraphQL strings (first 20):', mutationDefs.graphqlStrings);
  
  // Try to interact with profile form
  console.log('\n[+] Trying to interact with profile form...');
  try {
    // Find all form inputs
    const inputs = await page.locator('input, textarea, select').all();
    console.log(`  Found ${inputs.length} form inputs`);
    
    for (const input of inputs.slice(0, 10)) {
      try {
        const name = await input.getAttribute('name');
        const placeholder = await input.getAttribute('placeholder');
        const type = await input.getAttribute('type');
        console.log(`  Input: name=${name}, placeholder=${placeholder}, type=${type}`);
        
        // Try to fill text inputs
        if (type !== 'hidden' && type !== 'checkbox' && type !== 'radio' && (name || placeholder)) {
          await input.focus();
          await page.waitForTimeout(200);
          await input.blur();
          await page.waitForTimeout(200);
        }
      } catch (e) {}
    }
    
    // Look for save button
    const saveBtn = page.locator('button:has-text("Save"), button:has-text("Update"), button[type="submit"]').first();
    if (await saveBtn.count() > 0) {
      console.log('  Found save button, clicking...');
      await saveBtn.click();
      await page.waitForTimeout(5000);
      console.log('  Clicked save button');
    }
  } catch (e) {
    console.log('  Form interaction error:', e.message);
  }
  
  // Try settings/email page
  console.log('\n[+] Visiting settings/email page...');
  try {
    await page.goto('https://opensea.io/settings/email', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    const saveBtn = page.locator('button:has-text("Save"), button:has-text("Update"), button[type="submit"]').first();
    if (await saveBtn.count() > 0) {
      await saveBtn.hover();
      await page.waitForTimeout(1000);
      console.log('  Hovered save button on email page');
    }
  } catch (e) {
    console.log('  Email page error:', e.message);
  }
  
  // Try settings/security page
  console.log('\n[+] Visiting settings/security page...');
  try {
    await page.goto('https://opensea.io/settings/security', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    const saveBtn = page.locator('button:has-text("Save"), button:has-text("Update"), button[type="submit"]').first();
    if (await saveBtn.count() > 0) {
      await saveBtn.hover();
      await page.waitForTimeout(1000);
      console.log('  Hovered save button on security page');
    }
  } catch (e) {
    console.log('  Security page error:', e.message);
  }
  
  // Try to directly search for mutation hashes in loaded JS files
  console.log('\n=== Searching for mutation hashes in network resources ===');
  const jsResources = await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource');
    return resources
      .filter(r => r.name.includes('.js') || r.name.includes('graphql'))
      .map(r => r.name)
      .slice(0, 50);
  });
  console.log('JS resources:', jsResources);
  
  console.log(`\n[+] Total GraphQL captured: ${allCaptured.length}`);
  
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
  if (mutationDefs.mutations.length > 0) {
    mutationDefs.mutations.forEach(m => md += `- ${m}\n`);
  } else {
    md += `None found\n`;
  }
  
  md += `\n## Persisted Query Hashes Found in JS\n`;
  if (mutationDefs.mutationHashes.length > 0) {
    mutationDefs.mutationHashes.forEach(h => md += `- ${h}\n`);
  } else {
    md += `None found\n`;
  }
  
  md += `\n## GraphQL Operation Strings (sample)\n`;
  if (mutationDefs.graphqlStrings.length > 0) {
    mutationDefs.graphqlStrings.forEach(s => md += `- \`${s.substring(0, 100)}\`\n`);
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
    'ItemActionsQuery: c0613d136da337ea1d393c63655c7569b60ee81ac4b3fd19008b24dffc7c560d',
    'ItemAttributesQuery: 4ff18ba65ce77ce1d817fb5472eb0653aa8f95d3c712ce1db8de5ba7f7f1e40a',
    'ToolsDirectoryQuery: 95256318b087cb37e4bbe1a5d9787f92ba455f455f3f2b488fce0b5c6cb39701',
    'CollectionItemsCountQuery: e90cce9fffa40ca0c9e7b35e52dad7891b88f2b16034ecf8262a18379839882a',
    'ItemViewModalQuery: 3081f1bc87c81c1517fb8551df8c1e5cc771330c00973b01cdce1a20ad7a937b',
    'TradingCardGroupSlugsQuery: 5bcd4a62659fa27da2b62e0bf96795f9c18b6840be751ed5b4ee266c745f0b86',
  ];
  knownList.forEach(k => md += `- ${k}\n`);
  
  md += `\n## All Captured GraphQL Requests (Raw)\n`;
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
  console.log(`Total GraphQL requests captured: ${allCaptured.length}`);
  console.log(`GraphQL POST requests (mutations): ${postRequests.length}`);
  
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
    console.log('\nAll GraphQL POST requests captured:');
    postRequests.forEach(r => {
      console.log(`  - ${r.operationName || 'unknown'} (${r.sha256Hash?.substring(0, 16)}...): ${r.variables ? Object.keys(r.variables).join(', ') : 'no vars'}`);
    });
  }
  
  await browser.close();
}

main().catch(console.error);
