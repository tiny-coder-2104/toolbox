'use strict';
const fs = require('fs');
const { listTargets, evalInTab, clickByText } = require('./cdp');

async function findTab(substr) {
  const tabs = await listTargets();
  const match = tabs.find(t => (t.url || '').includes(substr) || (t.title || '').includes(substr));
  if (!match) throw new Error(`No tab matching "${substr}"`);
  return match.webSocketDebuggerUrl;
}

async function main() {
  const args = process.argv.slice(2);
  let snippetName, filePath, tabSubstr = 'chatbase', doIt = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--snippet' && args[i + 1]) snippetName = args[++i];
    else if (args[i] === '--file' && args[i + 1]) filePath = args[++i];
    else if (args[i] === '--tab' && args[i + 1]) tabSubstr = args[++i];
    else if (args[i] === '--yes') doIt = true;
    else if (args[i] === '--help') { console.log('Usage: node chatbase-kb.js --snippet <name> --file <path> [--tab <substring>] [--yes]'); process.exit(0); }
  }
  if (!snippetName || !filePath) { console.error('Usage: node chatbase-kb.js --snippet <name> --file <path> [--tab <substring>] [--yes]'); process.exit(1); }
  if (!fs.existsSync(filePath)) { console.error(`File not found: ${filePath}`); process.exit(1); }
  const wsUrl = await findTab(tabSubstr);
  const content = fs.readFileSync(filePath, 'utf8');
  if (!doIt) { console.log(`DRY-RUN: would set snippet "${snippetName}" to ${content.length} chars on tab "${tabSubstr}"`); process.exit(0); }
  const expr = `(function(){var els=document.querySelectorAll('[contenteditable=true]');for(var i=0;i<els.length;i++){if(els[i].textContent.includes(${JSON.stringify(snippetName)})){els[i].innerHTML=${JSON.stringify(content)};els[i].dispatchEvent(new Event('input',{bubbles:true}));els[i].dispatchEvent(new Event('blur',{bubbles:true}));return{ok:true,index:i}}}return{error:'not found'}})()`;
  await evalInTab(wsUrl, expr);
  await clickByText(wsUrl, 'button', 'Save');
  await clickByText(wsUrl, 'button', 'Retrain');
  console.log(`Updated snippet "${snippetName}" and triggered retrain on tab "${tabSubstr}"`);
}

if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
