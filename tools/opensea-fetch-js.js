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

// JS chunk URLs from the previous run
const jsChunks = [
  'https://opensea.io/_next/static/chunks/3klflh9vuhf29.js?dpl=dpl_6UB4QHrP5RqGNePEcepJ19EXxq6a',
  'https://opensea.io/_next/static/chunks/33s4jtkheb8i6.js?dpl=dpl_6UB4QHrP5RqGNePEcepJ19EXxq6a',
  'https://opensea.io/_next/static/chunks/3_50e2niw4otz.js?dpl=dpl_6UB4QHrP5RqGNePEcepJ19EXxq6a',
  'https://opensea.io/_next/static/chunks/1a3_zp39-azjp.js?dpl=dpl_6UB4QHrP5RqGNePEcepJ19EXxq6a',
  'https://opensea.io/_next/static/chunks/1gar0kkk5kyb3.js?dpl=dpl_6UB4QHrP5RqGNePEcepJ19EXxq6a',
  'https://opensea.io/_next/static/chunks/turbopack-2sttlwc5f94up.js?dpl=dpl_6UB4QHrP5RqGNePEcepJ19EXxq6a',
  'https://opensea.io/_next/static/chunks/0qql-9nhv-gr2.js?dpl=dpl_6UB4QHrP5RqGNePEcepJ19EXxq6a',
  'https://opensea.io/_next/static/chunks/1buvscwcy3uk0.js?dpl=dpl_6UB4QHrP5RqGNePEcepJ19EXxq6a',
  'https://opensea.io/_next/static/chunks/3lj0gunqi8w8w.js?dpl=dpl_6UB4QHrP5RqGNePEcepJ19EXxq6a',
  'https://opensea.io/_next/static/chunks/227g54t5b028v.js?dpl=dpl_6UB4QHrP5RqGNePEcepJ19EXxq6a',
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function searchForMutations(content, url) {
  const results = {
    mutations: [],
    hashes: [],
    operations: []
  };
  
  // Find mutation definitions
  const mutationMatches = content.match(/mutation\s+\w+/g);
  if (mutationMatches) {
    results.mutations.push(...mutationMatches);
  }
  
  // Find persisted query hashes
  const hashMatches = content.match(/sha256Hash["\s:=]+["']([a-f0-9]{64})["']/g);
  if (hashMatches) {
    results.hashes.push(...hashMatches);
  }
  
  // Find operation names with hashes
  const opMatches = content.match(/operationName["\s:=]+["']([^"']+)["'][\s\S]{0,100}?sha256Hash["\s:=]+["']([a-f0-9]{64})["']/g);
  if (opMatches) {
    results.operations.push(...opMatches);
  }
  
  // Find GraphQL operation strings
  const gqlMatches = content.match(/(query|mutation)\s+\w+[\s\S]{0,200}/g);
  if (gqlMatches) {
    results.operations.push(...gqlMatches.slice(0, 10));
  }
  
  return results;
}

async function main() {
  console.log('[+] Fetching JS chunks to search for mutations...');
  
  let allMutations = [];
  let allHashes = [];
  let allOperations = [];
  
  for (const url of jsChunks) {
    try {
      console.log(`  Fetching: ${url}`);
      const content = await fetchUrl(url);
      
      const results = searchForMutations(content, url);
      
      if (results.mutations.length > 0) {
        console.log(`    Found mutations: ${results.mutations.join(', ')}`);
        allMutations.push(...results.mutations);
      }
      
      if (results.hashes.length > 0) {
        console.log(`    Found hashes: ${results.hashes.join(', ')}`);
        allHashes.push(...results.hashes);
      }
      
      if (results.operations.length > 0) {
        console.log(`    Found operations: ${results.operations.length} matches`);
        allOperations.push(...results.operations);
      }
      
      // Also save the chunk for manual analysis
      const filename = path.basename(url).split('?')[0];
      fs.writeFileSync(`/tmp/${filename}`, content);
      
    } catch (e) {
      console.log(`    Error fetching ${url}: ${e.message}`);
    }
  }
  
  // Deduplicate
  allMutations = [...new Set(allMutations)];
  allHashes = [...new Set(allHashes)];
  allOperations = [...new Set(allOperations)];
  
  console.log('\n=== RESULTS ===');
  console.log('All mutations:', allMutations);
  console.log('All hashes:', allHashes);
  console.log('All operations (sample):', allOperations.slice(0, 10));
  
  // Check for new hashes
  const newHashes = allHashes.filter(h => {
    const hash = h.match(/([a-f0-9]{64})/);
    return hash && !KNOWN_HASHES.has(hash[1]);
  });
  
  console.log('\nNew hashes found:', newHashes);
  
  // Write results
  const dateStr = new Date().toISOString().split('T')[0];
  let md = `# OpenSea Mutations Captured — ${dateStr}\n\n`;
  
  md += `## New Mutations Found (from JS bundles)\n`;
  md += `| # | Operation Name | Hash | Method | Variables (keys) | Notes |\n`;
  md += `|---|---------------|------|--------|-----------------|-------|\n`;
  
  if (newHashes.length > 0) {
    newHashes.forEach((h, i) => {
      const hash = h.match(/([a-f0-9]{64})/)[1];
      md += `| ${i+1} | unknown | ${hash.substring(0, 16)}... | unknown | unknown | Found in JS bundle |\n`;
    });
  } else {
    md += `| - | No new mutations captured | - | - | - | Try more interactions |\n`;
  }
  
  md += `\n## Mutation Definitions Found in JS\n`;
  if (allMutations.length > 0) {
    allMutations.forEach(m => md += `- ${m}\n`);
  } else {
    md += `None found\n`;
  }
  
  md += `\n## Persisted Query Hashes Found in JS\n`;
  if (allHashes.length > 0) {
    allHashes.forEach(h => md += `- ${h}\n`);
  } else {
    md += `None found\n`;
  }
  
  md += `\n## GraphQL Operation Strings (sample)\n`;
  if (allOperations.length > 0) {
    allOperations.slice(0, 20).forEach(s => md += `- \`${s.substring(0, 150)}\`\n`);
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
