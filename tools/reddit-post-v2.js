'use strict';
const cdp = require('./cdp');

const REDDIT_TAB_ID = '6CCC39A5987661A656B5D4ED740364B5';
const REDDIT_WS_URL = `ws://127.0.0.1:9222/devtools/page/${REDDIT_TAB_ID}`;

const TITLE = "Built a JSON Validator CLI in 100 Lines of Node.js — zero dependencies";
const URL = "https://github.com/tiny-coder-2104/json-validator-cli";
const COMMENT = `Hey r/json! I built a simple CLI tool to validate JSON files from the terminal. It's just 100 lines of Node.js with zero dependencies.

Features:
- Detailed error messages with line/column numbers
- Pretty-print with --pretty flag
- Stdin support for piping
- Color output

Usage:
\`\`\`bash
json-validate data.json
json-validate --pretty config.json
cat package.json | json-validate
\`\`\`

GitHub: https://github.com/tiny-coder-2104/json-validator-cli

Would love your feedback!`;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Starting Reddit post automation...');
  console.log('Using Reddit tab:', REDDIT_TAB_ID);
  
  try {
    // Step 1: Check current page
    const pageText = await cdp.pageText(REDDIT_WS_URL);
    console.log('Current page text:', pageText.substring(0, 500));
    
    // Step 2: Fill title (input 0)
    console.log('Filling title...');
    await cdp.fillInput(REDDIT_WS_URL, { tag: 'input', index: 0, value: TITLE });
    await sleep(500);
    
    // Step 3: Fill URL (input 1)
    console.log('Filling URL...');
    await cdp.fillInput(REDDIT_WS_URL, { tag: 'input', index: 1, value: URL });
    await sleep(500);
    
    // Step 4: Try to click Link tab if it exists
    console.log('Looking for Link tab...');
    const linkClick = await cdp.clickByText(REDDIT_WS_URL, '*', 'Link');
    console.log('Link click result:', linkClick);
    
    // Step 5: Try to click Post button
    console.log('Looking for Post button...');
    const postClick = await cdp.clickByText(REDDIT_WS_URL, 'button', 'Post');
    console.log('Post click result:', postClick);
    
    if (postClick.error) {
      // Try other button texts
      for (const text of ['Submit', 'Create Post', 'Publish']) {
        const result = await cdp.clickByText(REDDIT_WS_URL, 'button', text);
        console.log(`${text} click result:`, result);
        if (!result.error) break;
      }
    }
    
    // Step 6: Wait and take screenshot
    await sleep(3000);
    const fs = require('fs');
    const path = require('path');
    const outDir = path.join(__dirname, '..', 'logs', 'navigator');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, `reddit-post-${Date.now()}.png`);
    await cdp.screenshot(REDDIT_WS_URL, outPath);
    console.log('Screenshot saved to:', outPath);
    
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
