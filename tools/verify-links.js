'use strict';
const https = require('https');
const http = require('http');
const { URL } = require('url');
const readline = require('readline');

const MAX_REDIRECTS = 3;

function fetchUrl(u, redirectCount) {
  return new Promise((resolve, reject) => {
    if (redirectCount > MAX_REDIRECTS) { resolve({ status: 0, url: u, redirected: true }); return; }
    const parsed = new URL(u);
    const mod = parsed.protocol === 'https:' ? https : http;
    const opts = { hostname: parsed.hostname, port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80), path: parsed.pathname + parsed.search, method: 'HEAD' };
    const req = mod.request(opts, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchUrl(res.headers.location, redirectCount + 1).then(resolve).catch(reject);
      } else {
        resolve({ status: res.statusCode, url: u, redirected: redirectCount > 0 });
      }
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) { console.log('Usage: node verify-links.js <url1> ... | stdin'); console.log('Flags: --check N'); process.exit(0); }
  let urls = [], checkN = 0;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--check' && args[i + 1]) { checkN = parseInt(args[++i]); continue; }
    if (args[i].startsWith('http')) urls.push(args[i]);
  }
  if (!urls.length) {
    const rl = readline.createInterface({ input: process.stdin });
    for await (const line of rl) { const u = line.trim(); if (u) urls.push(u); }
  }
  let failures = 0;
  for (const u of urls) {
    try {
      const r = await fetchUrl(u, 0);
      console.log(`${r.status} ${u}${r.redirected ? ' (redirected)' : ''}`);
      if (r.status < 200 || r.status >= 400) failures++;
    } catch (e) { console.log(`ERR ${u}: ${e.message}`); failures++; }
    if (checkN && failures >= checkN) process.exit(1);
  }
  process.exit(failures > 0 ? 1 : 0);
}

if (require.main === module) main().catch(e => { console.error(e); process.exit(1); });
module.exports = { fetchUrl };
