'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');
const { loadState, saveState } = require('./lib/state');
const { checkKillSwitch, checkReadiness } = require('./lib/guardrails');
const { logPost, getPostStatus } = require('./lib/logger');

const SESSION_URL = 'https://bsky.social/xrpc/com.atproto.server.createSession';
const POST_URL = 'https://bsky.social/xrpc/com.atproto.repo.createRecord';

function httpsRequest(url, opts, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}),
        ...opts.headers
      }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch(e) { resolve({ raw: d, status: res.statusCode }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function createSession(handle, appPassword) {
  const result = await httpsRequest(SESSION_URL, {}, { identifier: handle, password: appPassword });
  if (result.accessJwt && result.did) return result;
  throw new Error(result.error || 'Session creation failed');
}

async function createPost(did, accessJwt, text) {
  const record = { $type: 'app.bsky.feed.post', text, createdAt: new Date().toISOString() };
  const result = await httpsRequest(POST_URL, {
    headers: { 'Authorization': `Bearer ${accessJwt}` }
  }, { repo: did, collection: 'app.bsky.feed.post', record });
  return result;
}

async function postToBluesky(text, handle, appPassword) {
  const session = await createSession(handle, appPassword);
  const post = await createPost(session.did, session.accessJwt, text);
  return post;
}

async function whoamiBluesky(handle, appPassword) {
  const session = await createSession(handle, appPassword);
  return { handle: session.handle };
}

async function postBluesky(text, opts = {}) {
  const handle = process.env.BSKY_HANDLE;
  const appPassword = process.env.BSKY_APP_PASSWORD;
  if (!handle || !appPassword) return { posted: false, error: 'BSKY_HANDLE and BSKY_APP_PASSWORD not set' };

  if (checkKillSwitch()) { return { posted: false, reason: 'KILL_SWITCH armed' }; }
  const readiness = checkReadiness('bluesky');
  if (!readiness.ready) { return { posted: false, reason: 'Not ready', output: readiness.output }; }

  try {
    const result = await postToBluesky(text, handle, appPassword);
    const state = loadState();
    const now = new Date().toISOString();
    state.last_post = now;
    if (!state.platforms_posted.includes('bluesky')) state.platforms_posted.push('bluesky');
    saveState(state);
    logPost(text, 'bluesky');
    return { posted: true, platform: 'bluesky', result, timestamp: now };
  } catch (e) {
    return { posted: false, error: e.message };
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
console.log('Usage: node bluesky-poster.js --post <text> --yes | --whoami | --status | --check <platform> | --log');
    process.exit(0);
  }
  if (args.includes('--post')) {
    if (!args.includes('--yes')) { console.error('Error: --yes flag required. Dry-run by default.'); process.exit(1); }
    const idx = args.indexOf('--post');
    const text = args[idx + 1];
    if (!text) { console.error('Error: --post <text> required'); process.exit(1); }
    postBluesky(text).then(r => {
      console.log(JSON.stringify(r, null, 2));
      process.exit(r.posted ? 0 : 1);
    });
    return;
  }
  if (args.includes('--whoami')) {
    const handle = process.env.BSKY_HANDLE;
    const appPassword = process.env.BSKY_APP_PASSWORD;
    if (!handle || !appPassword) { console.error('Error: BSKY_HANDLE and BSKY_APP_PASSWORD not set'); process.exit(1); }
    whoamiBluesky(handle, appPassword).then(r => {
      console.log(JSON.stringify({ platform: 'bluesky', handle: r.handle }));
      process.exit(0);
    }).catch(e => { console.error('Auth failed'); process.exit(1); });
    return;
  }
  if (args.includes('--status')) { console.log(JSON.stringify(getPostStatus(), null, 2)); process.exit(0); }
  if (args.includes('--check')) {
    const plat = args[args.indexOf('--check') + 1] || 'bluesky';
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
    console.log('Usage: node bluesky-poster.js --post <text> --yes | --whoami | --status | --check <platform> | --log');
  process.exit(0);
}

module.exports = { postBluesky, createSession, createPost, whoamiBluesky };
