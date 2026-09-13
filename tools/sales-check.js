'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');

const DEFAULT_CSV = path.join(os.homedir(), 'ai_works', 'gumroad', 'sales.csv');

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) { console.log(`Usage: "${process.execPath}" sales-check.js [--file <path>] [--n <count>]\n  --file  Path to Gumroad sales CSV export (default: ${DEFAULT_CSV})\n  --n     Number of recent sales to show (default: 10)`); process.exit(0); }
  let filePath = DEFAULT_CSV, n = 10;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && args[i+1]) filePath = args[++i];
    else if (args[i] === '--n' && args[i+1]) n = parseInt(args[++i]);
  }
  if (process.env.GUMROAD_SALES_CSV) filePath = process.env.GUMROAD_SALES_CSV;
  if (!fs.existsSync(filePath)) { console.error(`Error: sales CSV not found at "${filePath}".\n  Download a Gumroad dashboard export (Settings → Sales → Export CSV) and place it there, or pass --file <path>.`); process.exit(1); }
  const lines = fs.readFileSync(filePath, 'utf8').trim().split('\n');
  if (lines.length <= 1) { console.log('No sales found'); process.exit(0); }
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const di = header.indexOf('date'), ei = header.indexOf('email'), pi = header.indexOf('product'), ai = header.indexOf('amount');
  const sales = lines.slice(1).map(l => l.split(',')).slice(-n);
  for (const s of sales) console.log(`${s[di] || ''} | ${s[ei] || ''} | ${s[pi] || ''} | ${s[ai] || ''}`);
}

if (require.main === module) main();
module.exports = { main };
