'use strict';
const https = require('https');
const http = require('http');
const { URL } = require('url');
const { logMetric } = require('./lib/metrics');

const DEFAULT_URL = 'https://toolbox-lilac-three.vercel.app';

function checkUrl(url) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const mod = parsed.protocol === 'https:' ? https : http;
    const start = Date.now();
    const req = mod.request({
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'GET',
      timeout: 10000
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        const responseTimeMs = Date.now() - start;
        resolve({ url, status: res.statusCode, responseTimeMs, live: res.statusCode >= 200 && res.statusCode < 400, bodyLength: body.length });
      });
    });
    req.on('error', () => {
      resolve({ url, status: 0, responseTimeMs: Date.now() - start, live: false, bodyLength: 0 });
    });
    req.on('timeout', () => { req.destroy(); resolve({ url, status: 0, responseTimeMs: Date.now() - start, live: false, bodyLength: 0 }); });
    req.end();
  });
}

async function main() {
  const args = process.argv.slice(2);
  let url = DEFAULT_URL;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) url = args[++i];
    else if (args[i] === '--help') { console.log('Usage: node analytics-check.js [--url <url>]'); process.exit(0); }
  }
  const result = await checkUrl(url);
  const output = { url: result.url, status: result.status, responseTimeMs: result.responseTimeMs, live: result.live, timestamp: new Date().toISOString() };
  logMetric('analytics', output);
  console.log(JSON.stringify(output, null, 2));
  process.exit(result.live ? 0 : 1);
}

if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { checkUrl };
