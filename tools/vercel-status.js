'use strict';
const { listTargets, evalInTab } = require('./cdp');

async function findTab(substr) {
  const tabs = await listTargets();
  const match = tabs.find(t => (t.url || '').includes(substr) || (t.title || '').includes(substr));
  if (!match) throw new Error(`No tab matching "${substr}"`);
  return match.webSocketDebuggerUrl;
}

async function main() {
  const args = process.argv.slice(2);
  let tabSubstr = 'vercel';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--tab' && args[i + 1]) tabSubstr = args[++i];
    else if (args[i] === '--help') { console.log('Usage: node vercel-status.js [--tab <substring>]'); process.exit(0); }
  }
  const wsUrl = await findTab(tabSubstr);
  const text = await evalInTab(wsUrl, 'document.body.innerText');
  const readyMatch = text.match(/READY|DEPLOYED|BUILDING|ERROR|CANCELLED/i);
  const shaMatch = text.match(/[a-f0-9]{7}/);
  const status = readyMatch ? readyMatch[0].toUpperCase() : 'UNKNOWN';
  const sha = shaMatch ? shaMatch[0] : 'N/A';
  console.log(`Status: ${status} | Latest commit: ${sha}`);
  process.exit(status === 'READY' ? 0 : 1);
}

if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
