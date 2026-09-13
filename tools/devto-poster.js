'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');
const { loadState, saveState, MIN_HOURS } = require('./lib/state');
const { checkKillSwitch, checkReadiness } = require('./lib/guardrails');
const { logPost, getPostStatus } = require('./lib/logger');

const API_URL = 'https://dev.to/api/articles';

function whoamiDevTo(apiKey) {
  return new Promise((resolve, reject) => {
    const req = https.request('https://dev.to/api/users/me', {
      headers: { 'api-key': apiKey, 'User-Agent': 'pseudo-human-poster/1.0' }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const user = JSON.parse(data);
          resolve({ username: user.username, name: user.name });
        } catch(e) { resolve({ error: 'Invalid response from dev.to' }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function postToDevTo(article, apiKey) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ article });
    const req = https.request(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
        'User-Agent': 'pseudo-human-poster/1.0',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { resolve({ raw: data, status: res.statusCode }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function postDevTo(text, opts = {}) {
  const apiKey = process.env.DEVTO_API_KEY;
  if (!apiKey) return { posted: false, error: 'DEVTO_API_KEY not set' };

  const article = {
    title: opts.title || 'Untitled',
    body_markdown: text,
    published: opts.published !== false,
    tags: opts.tags || ['javascript'],
    ...opts.article
  };

  try {
    const result = await postToDevTo(article, apiKey);
    const state = loadState();
    const now = new Date().toISOString();
    state.last_post = now;
    if (!state.platforms_posted.includes('devto')) state.platforms_posted.push('devto');
    saveState(state);
    logPost(text, 'devto');
    return { posted: true, platform: 'devto', result, timestamp: now };
  } catch (e) {
    return { posted: false, error: e.message };
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('Usage: node devto-poster.js --post <text> --yes [--title <t>] [--tags <tags>] | --whoami | --status | --check <platform> | --log');
    process.exit(0);
  }
  if (args.includes('--post')) {
    if (!args.includes('--yes')) { console.error('Error: --yes flag required. Dry-run by default.'); process.exit(1); }
    const idx = args.indexOf('--post');
    const text = args[idx + 1];
    if (!text) { console.error('Error: --post <text> required'); process.exit(1); }
    if (checkKillSwitch()) { console.log(JSON.stringify({posted: false, reason: 'KILL_SWITCH armed'})); process.exit(1); }
    const readiness = checkReadiness('devto');
    if (!readiness.ready) { console.log(JSON.stringify({posted: false, reason: 'Not ready', output: readiness.output})); process.exit(1); }
    const titleIdx = args.indexOf('--title');
    const title = titleIdx !== -1 && args[titleIdx + 1] ? args[titleIdx + 1] : 'Untitled';
    const tagsIdx = args.indexOf('--tags');
    const tags = tagsIdx !== -1 && args[tagsIdx + 1] ? args[tagsIdx + 1].split(',') : ['javascript'];
    postDevTo(text, { title, tags }).then(r => {
      console.log(JSON.stringify(r, null, 2));
      process.exit(r.posted ? 0 : 1);
    });
    return;
  }
  if (args.includes('--whoami')) {
    const apiKey = process.env.DEVTO_API_KEY;
    if (!apiKey) { console.error('Error: DEVTO_API_KEY not set'); process.exit(1); }
    whoamiDevTo(apiKey).then(r => {
      if (r.error) { console.error(r.error); process.exit(1); }
      console.log(JSON.stringify({ platform: 'dev.to', username: r.username, name: r.name }));
      process.exit(0);
    }).catch(e => { console.error('Auth failed'); process.exit(1); });
    return;
  }
  if (args.includes('--status')) { console.log(JSON.stringify(getPostStatus(), null, 2)); process.exit(0); }
  if (args.includes('--check')) {
    const plat = args[args.indexOf('--check') + 1] || 'devto';
    const r = checkReadiness(plat);
    console.log(r.output);
    process.exit(r.ready ? 0 : 1);
  }
  if (args.includes('--log')) {
    const logPath = path.join(__dirname, 'post-log.json');
    if (fs.existsSync(logPath)) console.log(fs.readFileSync(logPath, 'utf8'));
    else console.log('No posts logged yet');
    process.exit(0);
  }
  console.log('Usage: node devto-poster.js --post <text> --yes [--title <t>] [--tags <tags>] | --status | --check <platform> | --log');
  process.exit(0);
}

module.exports = { postDevTo, whoamiDevTo };
