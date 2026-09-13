const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = '/home/yuki/ai_works/pseudo_human/bug-bounty/notes/opensea-mutations-captured.md';

// Known hashes
const KNOWN_HASHES = new Set([
  'a61cfb87ef2335102f5f885dee334658f13e403696d3dc340267450340682f1e',
  'a8f0f7cff90c33f8e0a0faddf4747806a6dcb1d445463e33a0733f7cf53eb34f',
  '159702f9b2447942b17ca91172e017e840f61a93a4c03795566309cc2d77bce1',
  'acb06d8e0ed4e5cd09f62152f429bd7b987b0be05f17903d61686871a8382d78',
  '136bc0abbafacfb3c9bd0bc3532c709cf51c8e4c33e9dddbe04e1bbf18018d04',
  '623774b3ce1f48ef154d2f34cc98ca0d00fe950bf37ad0f24761170800768ea2',
  '8b45e422f5b8aa9f45f316b11b9362f05b7af87d88180e325c494b3860165e0e',
  'c21d7fe7e333865ed58f5f4143c7ef7e9f684309e0dea7a8ec7eb938df2bb11a',
  '28cc45304fcbe6df1ea3d79821cec1c14e4ffce9918b2521c1e57e60467dac60',
  'a42c430444701592ba32f808bcb62a18a8224e8223f60bbaa270865fc4edff09',
  'c0613d136da337ea1d393c63655c7569b60ee81ac4b3fd19008b24dffc7c560d',
  '4ff18ba65ce77ce1d817fb5472eb0653aa8f95d3c712ce1db8de5ba7f7f1e40a',
  '95256318b087cb37e4bbe1a5d9787f92ba455f455f3f2b488fce0b5c6cb39701',
  'e90cce9fffa40ca0c9e7b35e52dad7891b88f2b16034ecf8262a18379839882a',
  '3081f1bc87c81c1517fb8551df8c1e5cc771330c00973b01cdce1a20ad7a937b',
  '5bcd4a62659fa27da2b62e0bf96795f9c18b6840be751ed5b4ee266c745f0b86',
]);

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  console.log('[+] Fetching main page to find persisted query manifest...');
  
  // Fetch main page
  const html = await fetchUrl('https://opensea.io/');
  
  // Look for __NEXT_DATA__ script
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (nextDataMatch) {
    console.log('[+] Found __NEXT_DATA__ script');
    const nextData = JSON.parse(nextDataMatch[1]);
    
    // Save for analysis
    fs.writeFileSync('/tmp/next-data.json', JSON.stringify(nextData, null, 2));
    
    // Search for persisted queries in nextData
    const jsonStr = JSON.stringify(nextData);
    const hashMatches = jsonStr.match(/sha256Hash["\s:=]+["']([a-f0-9]{64})["']/g);
    if (hashMatches) {
      console.log('Found hashes in __NEXT_DATA__:', hashMatches);
    }
    
    // Search for operation names
    const opMatches = jsonStr.match(/operationName["\s:=]+["']([^"']+)["']/g);
    if (opMatches) {
      console.log('Found operations in __NEXT_DATA__:', [...new Set(opMatches)].slice(0, 20));
    }
  }
  
  // Fetch a few key pages to find the manifest
  const pages = [
    'https://opensea.io/tinycoderstudio',
    'https://opensea.io/item/ethereum/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/1',
    'https://opensea.io/settings/profile',
  ];
  
  let allHashes = [];
  let allOperations = [];
  
  for (const pageUrl of pages) {
    try {
      console.log(`\n[+] Fetching: ${pageUrl}`);
      const pageHtml = await fetchUrl(pageUrl);
      
      // Look for __NEXT_DATA__
      const nextDataMatch = pageHtml.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
      if (nextDataMatch) {
        const nextData = JSON.parse(nextDataMatch[1]);
        const jsonStr = JSON.stringify(nextData);
        
        const hashMatches = jsonStr.match(/sha256Hash["\s:=]+["']([a-f0-9]{64})["']/g);
        if (hashMatches) {
          console.log(`  Found ${hashMatches.length} hashes`);
          allHashes.push(...hashMatches);
        }
        
        const opMatches = jsonStr.match(/operationName["\s:=]+["']([^"']+)["']/g);
        if (opMatches) {
          console.log(`  Found ${opMatches.length} operations`);
          allOperations.push(...opMatches);
        }
      }
      
      // Also search directly in HTML for mutation strings
      const mutationMatches = pageHtml.match(/mutation\s+\w+/g);
      if (mutationMatches) {
        console.log(`  Found mutations in HTML: ${mutationMatches.join(', ')}`);
      }
      
    } catch (e) {
      console.log(`  Error: ${e.message}`);
    }
  }
  
  // Deduplicate
  allHashes = [...new Set(allHashes)];
  allOperations = [...new Set(allOperations)];
  
  console.log('\n=== ALL HASHES FOUND ===');
  allHashes.forEach(h => console.log(`  ${h}`));
  
  console.log('\n=== ALL OPERATIONS FOUND ===');
  allOperations.slice(0, 30).forEach(o => console.log(`  ${o}`));
  
  // Check for new hashes
  const newHashes = allHashes.filter(h => {
    const hash = h.match(/([a-f0-9]{64})/);
    return hash && !KNOWN_HASHES.has(hash[1]);
  });
  
  console.log('\n=== NEW HASHES ===');
  newHashes.forEach(h => console.log(`  ${h}`));
  
  // Write results
  const dateStr = new Date().toISOString().split('T')[0];
  let md = `# OpenSea Mutations Captured — ${dateStr}\n\n`;
  
  md += `## New Mutations Found (from page manifests)\n`;
  md += `| # | Operation Name | Hash | Method | Variables (keys) | Notes |\n`;
  md += `|---|---------------|------|--------|-----------------|-------|\n`;
  
  if (newHashes.length > 0) {
    newHashes.forEach((h, i) => {
      const hash = h.match(/([a-f0-9]{64})/)[1];
      // Try to find operation name associated with this hash
      const opMatch = allOperations.find(o => o.includes(hash.substring(0, 16)));
      const opName = opMatch ? opMatch.match(/operationName["\s:=]+["']([^"']+)["']/)?.[1] : 'unknown';
      md += `| ${i+1} | ${opName} | ${hash.substring(0, 16)}... | unknown | unknown | Found in page manifest |\n`;
    });
  } else {
    md += `| - | No new mutations captured | - | - | - | Try more interactions |\n`;
  }
  
  md += `\n## Mutation Definitions Found in HTML\n`;
  // We'll add this from the page fetches
  
  md += `\n## Persisted Query Hashes Found in Manifests\n`;
  if (allHashes.length > 0) {
    allHashes.forEach(h => md += `- ${h}\n`);
  } else {
    md += `None found\n`;
  }
  
  md += `\n## GraphQL Operation Names Found (sample)\n`;
  if (allOperations.length > 0) {
    allOperations.slice(0, 30).forEach(o => md += `- ${o}\n`);
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
  
  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(OUTPUT_FILE, md);
  console.log(`\n[+] Results written to: ${OUTPUT_FILE}`);
}

main().catch(console.error);
