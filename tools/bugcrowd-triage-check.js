'use strict';
const { listTargets, evalInTab, navigate, waitLoaded } = require('/home/yuki/ai_works/tiny_coder/tools/cdp');
const fs = require('fs');
const path = require('path');

const YES = process.argv.includes('--yes');
const DRY_RUN = !YES;

const STATE_FILE = '/home/yuki/ai_works/pseudo_human/bug-bounty/triage-state.json';
const LOGS_DIR = '/home/yuki/ai_works/pseudo_human/logs/navigator';

if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });

function ts() { return new Date().toISOString().replace(/[:.]/g, '-'); }

// ── Login check ──────────────────────────────────────────────

async function checkLoggedIn(wsUrl) {
  // Definitive test: /submissions loads when logged in, redirects to Okta when not.
  // (Marketing-page DOM checks are unreliable — "Hacker Login" is always in the nav.)
  await navigate(wsUrl, 'https://bugcrowd.com/submissions');
  await waitLoaded(wsUrl);
  await new Promise(r => setTimeout(r, 2000)); // let React render
  const r = await evalInTab(wsUrl, `JSON.stringify({ url: window.location.href, title: document.title })`);
  let v = r?.value || r;
  if (typeof v === 'string') { try { v = JSON.parse(v); } catch (e) {} }
  const url = (v && v.url) || '';
  const redirectedToOkta = /login\.hackers\.bugcrowd\.com|identity\.bugcrowd\.com|\/sign_in|\/login/.test(url);
  return !redirectedToOkta;
}

// ── Extract submissions from page ──────────────────────────

async function extractSubmissions(wsUrl) {
  // Poll until React renders the cards (page is a slow client-side app)
  let result = null;
  for (let attempt = 0; attempt < 8; attempt++) {
    const r = await evalInTab(wsUrl, `
    (function() {
      // Real structure: li.bc-submission-card > a[href*="/submissions/"] with
      // title, program, severity, status in the card text.
      var cards = document.querySelectorAll('li.bc-submission-card');
      var submissions = [];
      cards.forEach(function(card) {
        var link = card.querySelector('a[href*="/submissions/"]');
        var text = card.textContent.replace(/\\s+/g, ' ').trim();
        if (!text || text.length < 5) return;
        var id = null;
        if (link) {
          var m = link.getAttribute('href').match(/\\/submissions\\/([0-9a-f-]{36})/);
          if (m) id = m[1];
        }
        var title = link ? link.textContent.trim() : text.substring(0, 100);
        // Card format: <title><program>In progressSubmitted <date>Last activity <x>P<sev><STATUS><state desc> Comments <n>
        // DOM concatenates elements without spaces ("P4New"), so status = capitalized
        // word(s) right after the severity marker, whitespace optional.
        // DOM concatenates elements without spaces ("agoP3NewStill") — no \b before P.
        var statusMatch = text.match(/P[1-5]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,1})/);
        var sevMatch = text.match(/P[1-5]/);
        // Title = link text cut at the first workflow marker (never in titles).
        // Program name = the tail of the pre-marker text (report titles can start
        // with the program name, so match the trailing segment, not the first).
        var cut = title.search(/In progress|Submitted|Last activity/);
        var progName = 'unknown';
        if (cut > 0) {
          var pre = title.substring(0, cut).trim();
          // Program name = known program anchored at the END of the pre-marker text
          // (report titles can start with the program name, so match the tail)
          var tail = pre.match(/(OpenSea Managed Bug Bounty Program|Monash University Bug Bounty|Skyscanner|Asana|Atlassian|Canva|Glassdoor|Linktree|New Relic|Trello|OpenSea|Etsy|SEEK)$/);
          if (tail) {
            progName = tail[1];
            title = pre.substring(0, pre.length - progName.length).trim();
          } else {
            title = pre;
          }
        }
        submissions.push({
          id: id,
          title: title.substring(0, 120),
          program: progName,
          severity: sevMatch ? sevMatch[1] : '',
          status: statusMatch ? statusMatch[1] : 'unknown',
          text: text.substring(0, 250)
        });
      });
      return { count: submissions.length, submissions: submissions.slice(0, 50) };
    })()
  `);
    const v = r?.value || r;
    if (v && v.count > 0) { result = v; break; }
    await new Promise(res => setTimeout(res, 2000));
  }
  return result;
}

// ── Also try the API endpoint for cleaner data ──────────────

async function extractSubmissionsViaAPI(wsUrl) {
  const r = await evalInTab(wsUrl, `
    (function() {
      // Try to find submission data in the page state
      var data = null;
      var scripts = document.querySelectorAll('script');
      for (var i = 0; i < scripts.length; i++) {
        var s = scripts[i].innerHTML;
        if (s.includes('submissions') && s.includes('status')) {
          try {
            var match = s.match(/window\\.__INITIAL_STATE__\\s*=\\s*(\\{.*\\})/);
            if (match) { data = JSON.parse(match[1]); break; }
          } catch(e) {}
        }
      }
      if (data && data.submissions) return { source: 'initial-state', data: data.submissions };
      return { source: 'dom', count: 0 };
    })
  `);
  return r?.value || r;
}

// ── Load/save state ────────────────────────────────────────

function loadState() {
  if (!fs.existsSync(STATE_FILE)) return null;
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch(e) { return null; }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ── Main ───────────────────────────────────────────────────

async function main() {
  if (DRY_RUN) {
    console.log('=== DRY RUN ===');
    console.log('Would connect to Chrome via CDP port 9222');
    console.log('Would check login state');
    console.log('Would navigate to https://bugcrowd.com/submissions');
    console.log('Would extract all submissions (title, program, status)');
    console.log('Would diff against triage-state.json');
    console.log('Would print CHANGED entries');
    console.log('Would update triage-state.json');
    console.log('\\nRun with --yes to execute.');
    process.exit(0);
  }

  // ── Execute ──────────────────────────────────────────

  console.log('=== Bugcrowd Triage Check ===');

  // Find a page target
  const targets = await listTargets();
  let target = targets.find(t => t.type === 'page' && t.url && t.url.includes('bugcrowd.com'));
  if (!target) {
    target = targets.find(t => t.type === 'page' && t.url && !t.url.includes('chrome://') && !t.url.includes('chrome-extension://'));
  }
  if (!target) {
    console.error('No suitable page target found in Chrome');
    process.exit(1);
  }

  const wsUrl = target.webSocketDebuggerUrl;

  // Navigate to Bugcrowd before checking login
  console.log('Navigating to https://bugcrowd.com');
  await navigate(wsUrl, 'https://bugcrowd.com');
  await waitLoaded(wsUrl);

  // Check login
  console.log('Checking login state...');
  const loggedIn = await checkLoggedIn(wsUrl);
  if (!loggedIn) {
    console.error('Bugcrowd session not found in Chrome profile — log in manually in the browser (Okta MFA cannot be automated), then re-run');
    process.exit(1);
  }
  console.log('Logged in ✓');

  // Navigate to submissions page
  console.log('Navigating to https://bugcrowd.com/submissions');
  await navigate(wsUrl, 'https://bugcrowd.com/submissions');
  await waitLoaded(wsUrl);

  // Extract submissions
  console.log('Extracting submissions...');
  let result = await extractSubmissions(wsUrl);

  // If DOM extraction didn't work well, try API
  if (!result || result.count === 0) {
    console.log('DOM extraction empty, trying initial state...');
    result = await extractSubmissionsViaAPI(wsUrl);
  }

  const currentSubmissions = result?.submissions || [];
  console.log(`Found ${currentSubmissions.length} submissions`);

  // Load previous state
  const prevState = loadState();
  const now = new Date().toISOString();

  const newState = {
    lastCheck: now,
    submissions: {}
  };

  // Build current state map
  currentSubmissions.forEach(function(s) {
    newState.submissions[s.title || s.text] = {
      title: s.title,
      program: s.program,
      status: s.status
    };
  });

  // Diff and report changes
  if (prevState && prevState.submissions) {
    var changed = [];
    var newItems = [];
    var disappeared = [];

    // Check for new or changed submissions
    Object.keys(newState.submissions).forEach(function(key) {
      var curr = newState.submissions[key];
      var prev = prevState.submissions[key];
      if (!prev) {
        newItems.push(curr);
      } else if (prev.status !== curr.status) {
        changed.push({ title: key, from: prev.status, to: curr.status });
      }
    });

    // Check for disappeared
    Object.keys(prevState.submissions).forEach(function(key) {
      if (!newState.submissions[key]) {
        disappeared.push(key);
      }
    });

    // Print changes
    if (changed.length > 0) {
      console.log('\\n--- CHANGED ---');
      changed.forEach(function(c) {
        console.log(`  STATUS CHANGE: "${c.title}" ${c.from} → ${c.to}`);
      });
    }
    if (newItems.length > 0) {
      console.log('\\n--- NEW ---');
      newItems.forEach(function(n) {
        console.log(`  NEW: "${n.title}" (${n.program}) — ${n.status}`);
      });
    }
    if (disappeared.length > 0) {
      console.log('\\n--- DISAPPEARED ---');
      disappeared.forEach(function(d) {
        console.log(`  GONE: "${d}"`);
      });
    }
    if (changed.length === 0 && newItems.length === 0 && disappeared.length === 0) {
      console.log('\\nNo changes since last check.');
    }
  } else {
    console.log('\\nBaseline captured — first run, no previous state to diff against.');
  }

  // Save state
  saveState(newState);
  console.log(`\\nState saved to ${STATE_FILE}`);

  // Summary
  var pending = currentSubmissions.filter(function(s) {
    return !/resolved|closed|not applicable/i.test(s.status || '');
  }).length;
  console.log(`\\n=== SUMMARY ===`);
  console.log(`${currentSubmissions.length} submissions, ${pending} pending, ${changed ? changed.length : 0} changed since last check`);

  process.exit(0);
}

main().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
