const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const SCREENSHOT_DIR = '/home/yuki/ai_works/pseudo_human/logs/navigator';
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

async function main() {
  console.log('[+] Connecting to Chrome on port 9222...');
  
  const browser = await chromium.connectOverCDP('http://[::1]:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages()[0] || await context.newPage();
  
  // Visit a page that loads Apollo Client
  await page.goto('https://opensea.io/tinycoderstudio', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  
  // Try to access Apollo Client's persisted query map
  console.log('\n=== Searching Apollo Client cache ===');
  const apolloData = await page.evaluate(() => {
    const results = {
      persistedQueries: {},
      operations: [],
      mutations: []
    };
    
    // Try to find Apollo Client instance
    // It's often attached to window or in React context
    if (window.__APOLLO_CLIENT__) {
      const client = window.__APOLLO_CLIENT__;
      if (client.queryManager && client.queryManager.queryDocuments) {
        for (const [key, doc] of client.queryManager.queryDocuments) {
          if (doc && doc.definitions) {
            doc.definitions.forEach(def => {
              if (def.kind === 'OperationDefinition') {
                results.operations.push({
                  name: def.name?.value,
                  operation: def.operation,
                  variables: def.variableDefinitions?.map(v => v.variable.name.value) || []
                });
              }
            });
          }
        }
      }
    }
    
    // Search for persisted query map in window
    for (const key of Object.keys(window)) {
      if (key.toLowerCase().includes('apollo') || key.toLowerCase().includes('persist')) {
        try {
          const val = window[key];
          if (val && typeof val === 'object') {
            results.persistedQueries[key] = JSON.stringify(val).substring(0, 500);
          }
        } catch(e) {}
      }
    }
    
    // Search all scripts for mutation definitions
    const scripts = document.querySelectorAll('script');
    scripts.forEach(s => {
      if (s.textContent) {
        const mutationMatches = s.textContent.match(/mutation\s+\w+/g);
        if (mutationMatches) {
          results.mutations.push(...mutationMatches);
        }
      }
    });
    
    return results;
  });
  
  console.log('Apollo data:', JSON.stringify(apolloData, null, 2));
  
  // Try to access the persisted query link
  console.log('\n=== Checking for persisted query link ===');
  const linkData = await page.evaluate(() => {
    // Apollo's persisted query link often stores the map
    if (window.__APOLLO_CLIENT__ && window.__APOLLO_CLIENT__.link) {
      const link = window.__APOLLO_CLIENT__.link;
      // Traverse link chain
      let current = link;
      while (current) {
        if (current.persistedQueries) {
          return current.persistedQueries;
        }
        if (current.next) {
          current = current.next;
        } else {
          break;
        }
      }
    }
    return null;
  });
  
  console.log('Persisted query link:', linkData);
  
  // Try to get the operation registry from Apollo
  console.log('\n=== Checking Apollo operation registry ===');
  const registryData = await page.evaluate(() => {
    if (window.__APOLLO_CLIENT__ && window.__APOLLO_CLIENT__.queryManager) {
      const qm = window.__APOLLO_CLIENT__.queryManager;
      if (qm.transformCache) {
        const ops = {};
        for (const [key, val] of qm.transformCache) {
          ops[key] = val;
        }
        return ops;
      }
    }
    return null;
  });
  
  console.log('Registry data:', registryData);
  
  // Try a different approach - search for the hash map in all global objects
  console.log('\n=== Deep search for hash maps ===');
  const deepSearch = await page.evaluate(() => {
    const results = {
      hashes: [],
      operations: []
    };
    
    function searchObject(obj, path = '', depth = 0) {
      if (depth > 3) return;
      if (!obj || typeof obj !== 'object') return;
      if (obj.toString === Object.prototype.toString) return; // Skip plain objects that are too deep
      
      try {
        for (const key of Object.keys(obj)) {
          const val = obj[key];
          const newPath = path ? `${path}.${key}` : key;
          
          if (typeof val === 'string' && val.match(/^[a-f0-9]{64}$/)) {
            results.hashes.push({ path: newPath, hash: val });
          } else if (typeof val === 'string' && val.includes('mutation')) {
            results.operations.push({ path: newPath, value: val.substring(0, 200) });
          } else if (val && typeof val === 'object') {
            searchObject(val, newPath, depth + 1);
          }
        }
      } catch(e) {}
    }
    
    // Search window
    searchObject(window, 'window');
    
    // Search document
    searchObject(document, 'document');
    
    return results;
  });
  
  console.log('Deep search results:', JSON.stringify(deepSearch, null, 2));
  
  // Try to fetch the GraphQL schema or persisted query manifest directly
  console.log('\n=== Trying to fetch persisted query manifest ===');
  try {
    const manifestUrl = 'https://gql.opensea.io/graphql?app_id=os2-web&extensions={"persistedQuery":{"version":1,"sha256Hash":"acb06d8e0ed4e5cd09f62152f429bd7b987b0be05f17903d61686871a8382d78"}}';
    const response = await page.goto(manifestUrl, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Manifest response:', response?.status());
  } catch (e) {
    console.log('Manifest fetch error:', e.message);
  }
  
  // Write results
  const dateStr = new Date().toISOString().split('T')[0];
  let md = `# OpenSea Mutations Captured — ${dateStr}\n\n`;
  
  md += `## Apollo Client Analysis\n`;
  md += `### Persisted Queries Found\n`;
  if (Object.keys(apolloData.persistedQueries).length > 0) {
    for (const [key, val] of Object.entries(apolloData.persistedQueries)) {
      md += `- **${key}**: ${val}\n`;
    }
  } else {
    md += `None found\n`;
  }
  
  md += `\n### Operations Found\n`;
  if (apolloData.operations.length > 0) {
    apolloData.operations.forEach(op => {
      md += `- **${op.name}** (${op.operation}): variables=[${op.variables.join(', ')}]\n`;
    });
  } else {
    md += `None found\n`;
  }
  
  md += `\n### Mutations Found in Scripts\n`;
  if (apolloData.mutations.length > 0) {
    [...new Set(apolloData.mutations)].forEach(m => md += `- ${m}\n`);
  } else {
    md += `None found\n`;
  }
  
  md += `\n### Deep Search Hashes\n`;
  if (deepSearch.hashes.length > 0) {
    deepSearch.hashes.forEach(h => md += `- **${h.path}**: ${h.hash}\n`);
  } else {
    md += `None found\n`;
  }
  
  md += `\n### Deep Search Operations\n`;
  if (deepSearch.operations.length > 0) {
    deepSearch.operations.forEach(o => md += `- **${o.path}**: ${o.value}\n`);
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
  
  await browser.close();
}

main().catch(console.error);
