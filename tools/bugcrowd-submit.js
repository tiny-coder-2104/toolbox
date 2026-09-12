'use strict';
const { listTargets, evalInTab, screenshot: cdpScreenshot } = require('/home/yuki/ai_works/tiny_coder/tools/cdp');
const fs = require('fs');
const path = require('path');

const PROGRAM = process.argv.find((a, i) => process.argv[i - 1] === '--program');
const REPORT_PATH = process.argv.find((a, i) => process.argv[i - 1] === '--report');
const YES = process.argv.includes('--yes');
const DRY_RUN = !YES;

const LOGS_DIR = '/home/yuki/ai_works/pseudo_human/logs/navigator';
const HUNT_LOG = '/home/yuki/ai_works/pseudo_human/bug-bounty/logs/hunt-log.md';

if (!PROGRAM || !REPORT_PATH) {
  console.error('Usage: node bugcrowd-submit.js --program <code> --report <path-to-md> [--yes]');
  process.exit(1);
}

if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });

function ts() { return new Date().toISOString().replace(/[:.]/g, '-'); }

function doScreenshot(wsUrl) {
  const p = path.join(LOGS_DIR, `${ts()}-bugcrowd-submit.png`);
  return cdpScreenshot(wsUrl, p).catch(() => p);
}

function doErrorScreenshot(wsUrl) {
  const p = path.join(LOGS_DIR, `${ts()}-bugcrowd-submit-ERROR.png`);
  return cdpScreenshot(wsUrl, p).catch(() => p);
}

// ── Parse markdown report ──────────────────────────────────────────

function parseReport(mdPath) {
  const md = fs.readFileSync(mdPath, 'utf8');
  const lines = md.split('\n');

  const title = lines[0].replace(/^#\s+/, '').trim();
  const vrtLine = lines.find(l => l.startsWith('**VRT:**'));
  const severityLine = lines.find(l => l.startsWith('**Severity estimate:**'));
  const vrtPath = vrtLine ? vrtLine.replace('**VRT:**', '').trim() : '';
  const severity = severityLine ? severityLine.replace('**Severity estimate:**', '').trim().split(' ')[0] : '';

  const sections = {};
  let currentSection = null;
  let currentContent = [];
  for (const line of lines) {
    const m = line.match(/^##\s+(.+)/);
    if (m) {
      if (currentSection) sections[currentSection] = currentContent.join('\n').trim();
      currentSection = m[1].trim();
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }
  if (currentSection) sections[currentSection] = currentContent.join('\n').trim();

  const description = [sections['Summary'], sections['Steps to Reproduce'], sections['Impact'], sections['Evidence']]
    .filter(Boolean).join('\n\n');

  return { title, vrtPath, severity, description, sections };
}

// ── Login check ──────────────────────────────────────────────────────

async function checkLoggedIn(wsUrl) {
  const r = await evalInTab(wsUrl, `
    (function() {
      var text = document.body.innerText;
      var hasUserMenu = !!document.querySelector('[class*="user-menu"], [class*="avatar"], [class*="profile-menu"], .user-avatar, [data-testid="user-menu"]');
      var hasHackerLogin = text.includes('Hacker Login') || text.includes('Sign in');
      var hasDashboard = text.includes('Dashboard') || text.includes('My Submissions');
      return { hasUserMenu, hasHackerLogin, hasDashboard, url: window.location.href };
    })()
  `);
  const v = r?.value || r;
  if (!v) return false;
  // Logged in = has user menu/dashboard AND no Hacker Login button
  if (v.hasUserMenu || v.hasDashboard) return true;
  if (v.hasHackerLogin && !v.hasUserMenu) return false;
  // Fallback: check URL
  return v.url && !v.url.includes('/sign_in') && !v.url.includes('/login');
}

// ── VRT dropdown via React fiber walk ──────────────────────────────

async function selectVRT(wsUrl, vrtPath) {
  const parts = vrtPath.split(' > ').map(s => s.trim());
  const leafName = parts[parts.length - 1];

  const expr = `
    (function() {
      var dropdown = document.querySelector('.vrt-dropdown');
      if (!dropdown) return { error: 'no .vrt-dropdown element found' };

      // Walk up to find React fiber
      var fiber = dropdown;
      var depth = 0;
      while (fiber && depth < 50) {
        if (fiber._reactInternalFiber) { fiber = fiber._reactInternalFiber; break; }
        if (fiber._reactInternalInstance) { fiber = fiber._reactInternalInstance; break; }
        fiber = fiber.__reactInternalInstance$ || fiber.__reactInternalFiber$;
        if (!fiber) fiber = fiber.parentNode;
        depth++;
      }
      if (!fiber) return { error: 'could not find React fiber from .vrt-dropdown' };

      // Walk fiber tree to find component with memoizedState.rawFlatVRT
      var current = fiber;
      var visited = 0;
      while (current && visited < 200) {
        if (current.memoizedState && current.memoizedState.rawFlatVRT) {
          var state = current.memoizedState;
          var rawFlatVRT = state.rawFlatVRT;
          var inst = current.stateNode;
          if (!inst || typeof inst.onOptionSelect !== 'function') {
            return { error: 'found fiber but stateNode has no onOptionSelect', hasStateNode: !!inst };
          }

          // Find leaf variant matching the target name
          var leaf = null;
          var keys = Object.keys(rawFlatVRT);
          for (var i = 0; i < keys.length; i++) {
            var item = rawFlatVRT[keys[i]];
            if (item && item.name === '${leafName}') { leaf = item; break; }
          }
          if (!leaf) {
            return { error: 'leaf variant not found: ${leafName}', available: keys.map(function(k){return rawFlatVRT[k].name||k}) };
          }

          inst.onOptionSelect(leaf, true);
          return { ok: true, selected: leaf.name, category: '${parts[0]}' };
        }
        // Walk to child or sibling
        if (current.child) { current = current.child; }
        else if (current.sibling) { current = current.sibling; }
        else { current = current.return; }
        visited++;
      }
      return { error: 'fiber walk exhausted without finding rawFlatVRT' };
    })()
  `;

  const result = await evalInTab(wsUrl, expr);
  const r = result?.value || result;
  if (r?.error) throw new Error(`VRT selection failed: ${r.error}` + (r.available ? ` (available: ${r.available.join(', ')})` : ''));
  return r;
}

// ── Fill form fields ────────────────────────────────────────────────

async function fillForm(wsUrl, report) {
  // Title — use native setter for textarea, standard for input
  const titleResult = await evalInTab(wsUrl, `
    (function() {
      var el = document.querySelector('input[name="title"], input[id*="title"], textarea[name="title"]');
      if (!el) return { error: 'title field not found' };
      if (el.tagName === 'TEXTAREA') {
        Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set.call(el, ${JSON.stringify(report.title)});
      } else {
        el.value = ${JSON.stringify(report.title)};
      }
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true };
    })()
  `);
  const tr = titleResult?.value || titleResult;
  if (tr?.error) throw new Error(`Title fill failed: ${tr.error}`);

  // VRT dropdown via fiber walk
  console.log('  Selecting VRT:', report.vrtPath);
  await selectVRT(wsUrl, report.vrtPath);

  // Description textarea — native value setter + input event
  const descResult = await evalInTab(wsUrl, `
    (function() {
      var el = document.querySelector('textarea[name="description"], textarea[id*="description"], textarea[name="details"], textarea[name="submission[description]"], textarea[name="submission[details]"]');
      if (!el) return { error: 'description textarea not found' };
      Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set.call(el, ${JSON.stringify(report.description)});
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new Event('blur', { bubbles: true }));
      return { ok: true };
    })()
  `);
  const dr = descResult?.value || descResult;
  if (dr?.error) throw new Error(`Description fill failed: ${dr.error}`);

  // Severity selector if present
  if (report.severity) {
    const sevResult = await evalInTab(wsUrl, `
      (function() {
        var el = document.querySelector('select[name="severity"], select[id*="severity"], select[name="submission[severity]"]');
        if (!el) return { error: 'severity selector not found', skipped: true };
        el.value = ${JSON.stringify(report.severity)};
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return { ok: true };
      })()
    `);
    const sr = sevResult?.value || sevResult;
    if (sr?.skipped) console.log('  Severity selector not found, skipping');
  }
}

// ── Click submit ────────────────────────────────────────────────────

async function clickSubmit(wsUrl) {
  const r = await evalInTab(wsUrl, `
    (function() {
      var btn = document.querySelector('button[type="submit"]');
      if (!btn) {
        var allBtns = document.querySelectorAll('button');
        for (var i = 0; i < allBtns.length; i++) {
          var t = allBtns[i].textContent.trim();
          if (t.includes('Report vulnerability') || t.includes('Submit Report') || t.includes('Submit')) { btn = allBtns[i]; break; }
        }
      }
      if (!btn) return { error: 'submit button not found' };
      btn.click();
      return { ok: true };
    })()
  `);
  const v = r?.value || r;
  if (v?.error) throw new Error(`Submit click failed: ${v.error}`);
}

// ── Verify submission exists ────────────────────────────────────────

async function verifySubmission(wsUrl, program) {
  const r = await evalInTab(wsUrl, `
    (function() {
      var text = document.body.innerText;
      var hasSubmission = text.includes('${program}') || text.includes('Submission');
      return { url: window.location.href, hasSubmission, textPreview: text.substring(0, 200) };
    })()
  `);
  return r?.value || r;
}

// ── Main ─────────────────────────────────────────────────────────────

let _wsUrl = null; // used in catch handler

async function main() {
  const report = parseReport(REPORT_PATH);
  console.log(`Report parsed: "${report.title}"`);
  console.log(`VRT: ${report.vrtPath}`);
  console.log(`Severity: ${report.severity}`);
  console.log(`Description: ${report.description.length} chars`);

  if (DRY_RUN) {
    console.log(`\\n=== DRY RUN ===`);
    console.log(`Would navigate to https://bugcrowd.com/engagements/${PROGRAM}/submissions/new`);
    console.log(`Would check login state`);
    console.log(`Would fill title: "${report.title}"`);
    console.log(`Would select VRT: ${report.vrtPath}`);
    console.log(`Would set severity: ${report.severity}`);
    console.log(`Would fill description (${report.description.length} chars)`);
    console.log(`Would screenshot before/after fill`);
    console.log(`Would click "Report vulnerability"`);
    console.log(`Would verify at https://bugcrowd.com/submissions?program=${PROGRAM}`);
    console.log(`Would append to ${HUNT_LOG}`);
    console.log(`\\nRun with --yes to execute.`);
    process.exit(0);
  }

  // ── Execute ──────────────────────────────────────────────────

  console.log('\\n=== EXECUTING ===');

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

  _wsUrl = target.webSocketDebuggerUrl;

  // Navigate to program submission page
  console.log(`Navigating to https://bugcrowd.com/engagements/${PROGRAM}/submissions/new`);
  await evalInTab(_wsUrl, `window.location.href = 'https://bugcrowd.com/engagements/${PROGRAM}/submissions/new'`);
  await new Promise(r => setTimeout(r, 3000));

  // Check login
  console.log('Checking login state...');
  const loggedIn = await checkLoggedIn(_wsUrl);
  if (!loggedIn) {
    console.error('Bugcrowd session not found in Chrome profile — log in manually in the browser (Okta MFA cannot be automated), then re-run');
    process.exit(1);
  }
  console.log('Logged in ✓');

  // Screenshot before filling
  await doScreenshot(_wsUrl);

  // Fill form
  console.log('Filling form...');
  await fillForm(_wsUrl, report);

  // Screenshot after filling
  await doScreenshot(_wsUrl);

  // Submit
  console.log('Submitting...');
  await clickSubmit(_wsUrl);
  await new Promise(r => setTimeout(r, 5000)); // wait for turnstile + redirect

  // Verify
  console.log('Verifying submission...');
  const verification = await verifySubmission(_wsUrl, PROGRAM);
  console.log('Verification:', JSON.stringify(verification));

  // Navigate to submissions list
  await evalInTab(_wsUrl, `window.location.href = 'https://bugcrowd.com/submissions?program=${PROGRAM}'`);
  await new Promise(r => setTimeout(r, 3000));
  const subResult = await verifySubmission(_wsUrl, PROGRAM);
  console.log('Submissions list:', JSON.stringify(subResult));

  // Append to hunt log
  const logLine = `- \`${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC\` -  Submitted "${report.title}" to ${PROGRAM} (Bugcrowd) — status: submitted\\n`;
  fs.appendFileSync(HUNT_LOG, logLine);

  console.log('\\n=== SUCCESS ===');
  console.log(`Submission: "${report.title}" → ${PROGRAM}`);
  process.exit(0);
}

main().catch(err => {
  console.error('ERROR:', err.message);
  if (_wsUrl) {
    doErrorScreenshot(_wsUrl).then(() => {}).catch(() => {});
  }
  process.exit(1);
});
