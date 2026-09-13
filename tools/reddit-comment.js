'use strict';
const fs = require('fs');
const path = require('path');
const cdp = require('./cdp');
const { checkKillSwitch } = require('./lib/guardrails');
const { logPost } = require('./lib/logger');

// ponytail: skip 48h for comments, launch posts still gated
const MIN_COMMENT_LEN = 1;
const MAX_COMMENT_LEN = 1000;

function findRedditTab() {
  return cdp.listTargets().then(t => t.find(t => t.url && t.url.includes('reddit.com')) || null);
}

function safeText(text) { return JSON.stringify(text); }

async function postComment(url, text) {
  const tab = await findRedditTab();
  if (!tab) {
    return { success: false, error: 'No Reddit tab found. Start Chrome with --remote-debugging-port=9222 and open reddit.com logged in.' };
  }
  const wsUrl = `ws://127.0.0.1:9222/devtools/page/${tab.id}`;

  await cdp.navigate(wsUrl, url);
  await cdp.waitLoaded(wsUrl);
  await new Promise(r => setTimeout(r, 2000));

  const commentBox = await cdp.evalInTab(wsUrl, `(function() {
    var selectors = ['textarea[name="text"]', 'div[contenteditable][data-lexical]', 'shreddit-composer textarea', 'div[role="textbox"]'];
    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      if (el) return { found: true, selector: selectors[i], tag: el.tagName };
    }
    return { found: false };
  })()`);

  if (!commentBox.found) {
    return { success: false, error: 'Could not find comment box on the page.' };
  }

  const typed = await cdp.evalInTab(wsUrl, `(function() {
    var selectors = ['textarea[name="text"]', 'div[contenteditable][data-lexical]', 'shreddit-composer textarea', 'div[role="textbox"]'];
    var ta = null;
    for (var i = 0; i < selectors.length; i++) {
      ta = document.querySelector(selectors[i]);
      if (ta) break;
    }
    if (!ta) return 'not-found';
    ta.focus();
    document.execCommand('insertText', false, ${safeText(text)});
    return 'typed:' + (ta.innerText || ta.value || '').length;
  })()`);

  if (typeof typed === 'string' && typed === 'not-found') {
    return { success: false, error: 'Could not type into comment box.' };
  }

  await new Promise(r => setTimeout(r, 1000));

  const clicked = await cdp.evalInTab(wsUrl, `(function() {
    var btns = document.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      var t = btns[i].textContent.trim();
      if (t === 'Comment' || t === 'Reply' || t === 'Submit') { btns[i].click(); return 'clicked:' + t; }
    }
    return 'no-button';
  })()`);

  await new Promise(r => setTimeout(r, 2000));

  const snippet = text.substring(0, 50);
  const verify = await cdp.pageText(wsUrl);
  const posted = verify.includes(snippet);

  const now = new Date().toISOString();
  logPost(text, 'reddit-comment');

  return { success: posted, posted, timestamp: now, rawResponse: { typed, clicked, verified: posted } };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('Usage: node reddit-comment.js --url <thread_url> --text <comment> --yes | --help');
    process.exit(0);
  }

  const urlIdx = args.indexOf('--url');
  const textIdx = args.indexOf('--text');
  const url = urlIdx !== -1 && args[urlIdx + 1] ? args[urlIdx + 1] : null;
  const text = textIdx !== -1 && args[textIdx + 1] ? args[textIdx + 1] : null;

  if (!url) {
    console.error('Error: --url <thread_url> is required');
    process.exit(1);
  }
  if (!text || text.length === 0) {
    console.error('Error: --text <comment> is required');
    process.exit(1);
  }

  if (!url.includes('reddit.com') || !url.includes('/comments/')) {
    console.error('Error: URL must be a reddit.com/comments/ thread URL');
    process.exit(1);
  }

  if (text.length < MIN_COMMENT_LEN || text.length > MAX_COMMENT_LEN) {
    console.error(`Error: Comment text must be ${MIN_COMMENT_LEN}-${MAX_COMMENT_LEN} characters`);
    process.exit(1);
  }

  if (!args.includes('--yes')) {
    console.log('[DRY-RUN] Would post comment to:', url);
    console.log('[DRY-RUN] Comment text:', text.substring(0, 80) + '...');
    console.log('[DRY-RUN] Pass --yes to execute.');
    process.exit(0);
  }

  if (checkKillSwitch()) {
    console.log(JSON.stringify({ posted: false, reason: 'KILL_SWITCH armed', output: 'Agent is stopped. Cannot post.' }));
    process.exit(1);
  }

  try {
    const result = await postComment(url, text);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  } catch (e) {
    console.log(JSON.stringify({ success: false, error: e.message }));
    process.exit(1);
  }
}

if (require.main === module) main();
module.exports = { postComment, findRedditTab };
