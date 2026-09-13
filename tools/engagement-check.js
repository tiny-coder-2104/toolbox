'use strict';
const https = require('https');
const { URL } = require('url');
const { logMetric } = require('./lib/metrics');

const DID = 'did:plc:sejria6z4qdf2sfta6bad7fd';
const ARTICLE_IDS = [4615810, 4618264];

function httpsRequest(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const data = opts.body ? JSON.stringify(opts.body) : null;
    const queryString = opts.params ? '?' + new URLSearchParams(opts.params).toString() : '';
    const path = parsed.pathname + parsed.search + queryString;
    const req = https.request({
      hostname: parsed.hostname,
      path,
      method: opts.method || 'GET',
      headers: {
        ...(opts.headers || {}),
        ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {})
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

async function bskySession(handle, appPassword) {
  const result = await httpsRequest('https://bsky.social/xrpc/com.atproto.server.createSession', {
    method: 'POST',
    body: { identifier: handle, password: appPassword }
  });
  if (result.accessJwt && result.did) return result;
  throw new Error(result.error || 'BSKY session failed');
}

async function bskyListRecords(handle, appPassword) {
  const session = await bskySession(handle, appPassword);
  const result = await httpsRequest(`https://bsky.social/xrpc/com.atproto.repo.listRecords`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${session.accessJwt}` },
    params: { repo: session.did, collection: 'app.bsky.feed.post', limit: 1 }
  });
  return result;
}

async function bskyGetPostThread(handle, appPassword, uri) {
  const session = await bskySession(handle, appPassword);
  const result = await httpsRequest(`https://bsky.social/xrpc/app.bsky.feed.getPostThread`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${session.accessJwt}` },
    params: { uri, depth: 0 }
  });
  return result;
}

async function checkBluesky() {
  const handle = process.env.BSKY_HANDLE;
  const appPassword = process.env.BSKY_APP_PASSWORD;
  if (!handle || !appPassword) return { error: 'BSKY_HANDLE and BSKY_APP_PASSWORD not set' };

  const posts = await bskyListRecords(handle, appPassword);
  if (!posts.records || !posts.records.length) return { error: 'No posts found' };

  const postUri = posts.records[0].uri;
  const thread = await bskyGetPostThread(handle, appPassword, postUri);

  const root = thread.thread?.post || thread.post;
  const likeCount = root.likeCount || 0;
  const repostCount = root.repostCount || 0;
  const replyCount = root.replyCount || 0;

  return { platform: 'bluesky', engagement: { likes: likeCount, reposts: repostCount, comments: replyCount }, uri: postUri };
}

async function checkDevTo() {
  const apiKey = process.env.DEVTO_API_KEY;
  if (!apiKey) return { error: 'DEVTO_API_KEY not set' };

  let totalLikes = 0, totalComments = 0;
  const articles = [];

  for (const id of ARTICLE_IDS) {
    const article = await httpsRequest(`https://dev.to/api/articles/${id}`, {
      headers: { 'api-key': apiKey, 'User-Agent': 'pseudo-human-poster/1.0' }
    });
    if (!article.error) {
      const likes = article.positive_reactions_count || 0;
      const comments = article.comments_count || 0;
      totalLikes += likes;
      totalComments += comments;
      articles.push({ id, title: article.title?.substring(0, 50), likes, comments });
    }
  }

  return {
    platform: 'devto',
    engagement: { likes: totalLikes, reposts: 0, comments: totalComments },
    articles
  };
}

async function checkTwitter() {
  return { platform: 'twitter', note: 'Use CDP to check profile manually' };
}

async function main() {
  const args = process.argv.slice(2);
  let platform = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--platform' && args[i + 1]) platform = args[++i];
    else if (args[i] === '--help') { console.log('Usage: node engagement-check.js --platform <twitter|bluesky|devto>'); process.exit(0); }
  }

  if (!platform) { console.error('Error: --platform <twitter|bluesky|devto> required'); process.exit(1); }

  let result;
  switch (platform) {
    case 'bluesky': result = await checkBluesky(); break;
    case 'devto': result = await checkDevTo(); break;
    case 'twitter': result = await checkTwitter(); break;
    default: console.error(`Error: unknown platform "${platform}"`); process.exit(1);
  }

  const output = { platform: result.platform, engagement: result.engagement || {}, timestamp: new Date().toISOString(), ...(result.note ? { note: result.note } : {}) };
  logMetric('engagement', output);
  console.log(JSON.stringify(output, null, 2));
  process.exit(0);
}

if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { checkBluesky, checkDevTo, checkTwitter };
