'use strict';
const fs = require('fs');
const path = require('path');
const cdp = require('./cdp');
const { loadState, saveState } = require('./lib/state');
const { checkKillSwitch, checkReadiness } = require('./lib/guardrails');
const { logPost, getPostStatus } = require('./lib/logger');

const TWITTER_URL = 'https://x.com/compose/tweet';

async function findTwitterTab() {
  const targets = await cdp.listTargets();
  const twitterTab = targets.find(t => t.url && t.url.includes('x.com'));
  return twitterTab || null;
}

async function postViaCDP(text) {
  const tab = await findTwitterTab();
  const wsUrl = tab ? `ws://127.0.0.1:9222/devtools/page/${tab.id}` : null;

  if (!tab || !wsUrl) {
    return { success: false, error: 'No Twitter tab found. Open x.com in the debug Chrome first.' };
  }

  const safeText = JSON.stringify(text);

  try {
    await cdp.evalInTab(wsUrl, `window.location.href='${TWITTER_URL}'`);
    await new Promise(r => setTimeout(r, 3000));

    const checkResult = await cdp.evalInTab(wsUrl, `
      (function() {
        var ta = document.querySelector('[data-testid="tweetTextarea_0"], [data-testid="tweetTextarea"], textarea[aria-label="Post"], div[role="textbox"][aria-label="Post"]');
        if (ta) { ta.focus(); return 'found:' + ta.tagName + ':' + (ta.contentEditable || ''); }
        var allDivs = document.querySelectorAll('div[contenteditable="true"]');
        for (var i = 0; i < allDivs.length; i++) {
          if (allDivs[i].getAttribute('aria-label') === 'Post') return 'found:contentEditable:' + allDivs[i].className?.substring(0, 50);
        }
        return 'not-found';
      })()
    `);

    if (typeof checkResult === 'string' && checkResult.startsWith('not-found')) {
      await new Promise(r => setTimeout(r, 2000));
      const check2 = await cdp.evalInTab(wsUrl, `
        (function() {
          var ta = document.querySelector('[data-testid="tweetTextarea_0"]');
          return ta ? 'found' : document.querySelector('textarea[aria-label="Post"]') ? 'found-ta' : 'still-not-found';
        })()
      `);
      if (check2 !== 'found' && check2 !== 'found-ta') {
        return { success: false, error: 'Could not find tweet text area. ' + checkResult + ', ' + check2 };
      }
    }

    await cdp.evalInTab(wsUrl, `(function() {
      var ta = document.querySelector('[data-testid="tweetTextarea_0"], textarea[aria-label="Post"], div[role="textbox"][aria-label="Post"]');
      if (!ta) {
        var allDivs = document.querySelectorAll('div[contenteditable="true"]');
        for (var i = 0; i < allDivs.length; i++) {
          if (allDivs[i].getAttribute('aria-label') === 'Post') { ta = allDivs[i]; break; }
        }
      }
      if (ta) { ta.focus(); return ta; }
      return null;
    })()`);

    // X uses a Lexical contentEditable editor: ta.value + synthetic events do
    // nothing. execCommand('insertText') goes through the real input path.
    const typed = await cdp.evalInTab(wsUrl, `(function() {
      var ta = document.querySelector('[data-testid="tweetTextarea_0"], textarea[aria-label="Post"], div[role="textbox"][aria-label="Post"]');
      if (!ta) {
        var allDivs = document.querySelectorAll('div[contenteditable="true"]');
        for (var i = 0; i < allDivs.length; i++) {
          if (allDivs[i].getAttribute('aria-label') === 'Post') { ta = allDivs[i]; break; }
        }
      }
      if (!ta) return 'not found';
      ta.focus();
      document.execCommand('selectAll', false, null);
      var ok = document.execCommand('insertText', false, ${safeText});
      return ok ? ('typed:' + (ta.innerText || '').length) : 'insert-failed';
    })()`);

    if (typeof typed === 'string' && (typed === 'not found' || typed === 'insert-failed')) {
      return { success: false, error: 'Could not type into tweet editor: ' + typed };
    }

    await new Promise(r => setTimeout(r, 1000));

    const clicked = await cdp.evalInTab(wsUrl, `(function() {
      var btn = document.querySelector('[data-testid="tweetButtonInline"], [data-testid="tweetButton"]');
      if (btn) { btn.click(); return 'clicked'; }
      var allBtns = document.querySelectorAll('button');
      for (var i = 0; i < allBtns.length; i++) {
        var t = allBtns[i].textContent.trim();
        if (t.includes('Post') || t.includes('Tweet')) { allBtns[i].click(); return 'clicked:' + t; }
      }
      return 'no-button';
    })()`);

    await new Promise(r => setTimeout(r, 3000));

    const verify = await cdp.evalInTab(wsUrl, `document.body.innerText.includes('Post posted') || document.body.innerText.includes('Your post was posted') || window.location.href.includes('status/')`);

    const state = loadState();
    const now = new Date().toISOString();
    state.last_post = now;
    if (!state.platforms_posted.includes('twitter')) state.platforms_posted.push('twitter');
    saveState(state);

    return { success: true, posted: true, timestamp: now, rawResponse: {clicked, verified: verify} };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function postTweet(text) {
  return postViaCDP(text);
}

async function postScheduled(tweetText, platform) {
  const plat = platform || 'twitter';

  if (checkKillSwitch()) {
    return { posted: false, reason: 'KILL_SWITCH armed', output: 'Agent is stopped. Cannot post.' };
  }

  const readiness = checkReadiness(plat);
  if (!readiness.ready) {
    return { posted: false, reason: 'Not ready', output: readiness.output };
  }

  try {
    const result = await postViaCDP(tweetText);
    if (!result.success) return result;
    const state = loadState();
    const now = new Date().toISOString();
    state.last_post = now;
    if (!state.platforms_posted.includes(plat)) state.platforms_posted.push(plat);
    saveState(state);
    console.log(`[${now}] Posted to ${plat}: ${tweetText.substring(0, 80)}...`);
    return result;
  } catch (e) {
    return { posted: false, error: e.message };
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('Usage: node twitter-poster.js --post <text> --yes [--platform <name>] | --status | --check <platform> | --log');
    process.exit(0);
  }
  if (args.includes('--post')) {
    if (!args.includes('--yes')) {
      console.error('Error: --yes flag required for posting. Use --post <text> --yes');
      process.exit(1);
    }
    const idx = args.indexOf('--post');
    const text = args[idx + 1];
    if (!text) { console.error('Error: --post <text> required'); process.exit(1); }
    const platIdx = args.indexOf('--platform');
    const plat = platIdx !== -1 && args[platIdx + 1] ? args[platIdx + 1] : 'twitter';
    postScheduled(text, plat).then(r => {
      console.log(JSON.stringify(r, null, 2));
      process.exit(r.posted ? 0 : 1);
    });
    return;
  }
  if (args.includes('--status')) {
    console.log(JSON.stringify(getPostStatus(), null, 2));
    process.exit(0);
  }
  if (args.includes('--check')) {
    const plat = args[args.indexOf('--check') + 1] || 'twitter';
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
  console.log('Usage: node twitter-poster.js --post <text> --yes [--platform <name>] | --status | --check <platform> | --log');
  process.exit(0);
}

module.exports = { checkReadiness, postTweet, postScheduled, getPostStatus, logPost };
