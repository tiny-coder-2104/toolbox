'use strict';
const fs = require('fs');
const { listTargets, setFileInput } = require('./cdp');

async function findTab(substr) {
  const tabs = await listTargets();
  const match = tabs.find(t => (t.url || '').includes(substr) || (t.title || '').includes(substr));
  if (!match) throw new Error(`No tab matching "${substr}"`);
  return match.webSocketDebuggerUrl;
}

async function main() {
  const args = process.argv.slice(2);
  let filePath, tabSubstr = 'products/gyhehh/edit', doIt = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && args[i + 1]) filePath = args[++i];
    else if (args[i] === '--tab' && args[i + 1]) tabSubstr = args[++i];
    else if (args[i] === '--yes') doIt = true;
    else if (args[i] === '--help') { console.log('Usage: node gumroad-upload.js --file <path> [--tab <substring>] [--yes]'); process.exit(0); }
  }
  if (!filePath) { console.error('Usage: node gumroad-upload.js --file <path> [--tab <substring>] [--yes]'); process.exit(1); }
  if (!fs.existsSync(filePath)) { console.error(`File not found: ${filePath}`); process.exit(1); }
  const wsUrl = await findTab(tabSubstr);
  console.log(`Found tab: ${tabSubstr}`);
  if (!doIt) { console.log(`DRY-RUN: would setFileInput("${filePath}") on tab "${tabSubstr}"`); process.exit(0); }
  await setFileInput(wsUrl, 'input[type="file"]', filePath);
  console.log(`Uploaded ${filePath} to Gumroad tab "${tabSubstr}"`);
}

if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
