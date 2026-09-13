'use strict';
const { listTargets, evalInTab, navigate, waitLoaded, screenshot: cdpScreenshot } = require('/home/yuki/ai_works/tiny_coder/tools/cdp');
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

  // Bug URL: first http(s) URL in the Affected endpoint section
  const endpointSection = sections['Affected endpoint'] || '';
  const urlMatch = endpointSection.match(/https?:\/\/[^\s`)]+/);
  const bugUrl = urlMatch ? urlMatch[0].replace(/[.,;]+$/, '') : '';

  return { title, vrtPath, severity, description, bugUrl, sections };
}

// ── Login check ──────────────────────────────────────────────────────

async function checkLoggedIn(wsUrl) {
  // No navigation: the caller has already navigated to the target page.
  // If it loaded (not redirected to Okta), we're logged in.
  const r = await evalInTab(wsUrl, `JSON.stringify({ url: window.location.href, title: document.title })`);
  let v = r?.value || r;
  if (typeof v === 'string') { try { v = JSON.parse(v); } catch (e) {} }
  const url = (v && v.url) || '';
  const redirectedToOkta = /login\.hackers\.bugcrowd\.com|identity\.bugcrowd\.com|\/sign_in|\/login/.test(url);
  return !redirectedToOkta;
}

// ── VRT dropdown via React fiber walk ──────────────────────────────

async function selectVRT(wsUrl, vrtPath) {
  const parts = vrtPath.split(' > ').map(s => s.trim());
  const leafName = parts[parts.length - 1];

  const expr = `
    (function() {
      var dropdown = document.querySelector('.vrt-dropdown');
      if (!dropdown) return { error: 'no .vrt-dropdown element found' };

      // Walk up the DOM tree from the dropdown until a node with a React fiber.
      // React 18+ uses randomized keys (__reactFiber$<rand>), older uses __reactInternalFiber$.
      function fiberKey(el) {
        var keys = Object.getOwnPropertyNames(el);
        for (var i = 0; i < keys.length; i++) {
          if (keys[i].indexOf('__reactFiber$') === 0 || keys[i].indexOf('__reactInternalFiber$') === 0) return keys[i];
        }
        return null;
      }
      var fiber = dropdown;
      var depth = 0;
      while (fiber && depth < 50) {
        var fk = fiberKey(fiber);
        if (fk) { fiber = fiber[fk]; break; }
        fiber = fiber.parentNode;
        depth++;
      }
      if (!fiber) return { error: 'could not find React fiber from .vrt-dropdown' };

      // Walk UP the fiber return chain — the VRT component is an ancestor of the dropdown
      var current = fiber;
      var visited = 0;
      while (current && visited < 50) {
        if (current.memoizedState && current.memoizedState.rawFlatVRT) {
          var state = current.memoizedState;
          var rawFlatVRT = state.rawFlatVRT;
          var inst = current.stateNode;
          if (!inst || typeof inst.onOptionSelect !== 'function') {
            return { error: 'found fiber but stateNode has no onOptionSelect', hasStateNode: !!inst };
          }

          // Find leaf variant matching the target name.
          // rawFlatVRT names are FULL paths ("Cat > Sub > Leaf") with
          // inconsistent spacing ("View Sensitive Information(Iterable...)")
          // — normalize by stripping whitespace and comparing leaf names.
          function norm(s) { return s.replace(/\\s+/g, '').toLowerCase(); }
          var leafNorm = norm('${leafName}');
          var leaf = null;
          var keys = Object.keys(rawFlatVRT);
          for (var i = 0; i < keys.length; i++) {
            var item = rawFlatVRT[keys[i]];
            if (!item || !item.name) continue;
            var itemLeaf = item.name.split('>').pop().trim();
            if (norm(itemLeaf) === leafNorm) { leaf = item; break; }
          }
          if (!leaf) {
            // Fallback: full-path normalized match
            for (var i = 0; i < keys.length; i++) {
              var item = rawFlatVRT[keys[i]];
              if (!item || !item.name) continue;
              if (norm(item.name) === norm('${vrtPath}')) { leaf = item; break; }
            }
          }
          if (!leaf) {
            return { error: 'leaf variant not found: ${leafName}', available: keys.map(function(k){return rawFlatVRT[k].name||k}) };
          }

          inst.onOptionSelect(leaf, false); // false = don't toggle dropdown open
          return { ok: true, selected: leaf.name, category: '${parts[0]}' };
        }
        current = current.return;
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
  // Title — the real field is submission[caption]
  const titleResult = await evalInTab(wsUrl, `
    (function() {
      var el = document.querySelector('input[name="submission[caption]"], input[name="title"], input[id*="title"], textarea[name="title"]');
      if (!el) return { error: 'title field not found' };
      if (el.tagName === 'TEXTAREA') {
        Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set.call(el, ${JSON.stringify(report.title)});
      } else {
        // React-controlled input: native setter, not direct assignment
        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(el, ${JSON.stringify(report.title)});
      }
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true };
    })()
  `);
  const tr = titleResult?.value || titleResult;
  if (tr?.error) throw new Error(`Title fill failed: ${tr.error}`);

  // Target select — prefer domain-style match (opensea.io over "io.opensea - Android App")
  const targetResult = await evalInTab(wsUrl, `
    (function() {
      var sel = document.querySelector('select[name="submission[target_id]"]');
      if (!sel) return { error: 'target select not found' };
      var prog = '${PROGRAM.toLowerCase()}';
      var opts = Array.from(sel.options).filter(function(o) { return o.value; });
      var match = opts.find(function(o) { return o.textContent.trim().toLowerCase() === prog; })
        || opts.find(function(o) { return o.textContent.trim().toLowerCase().indexOf(prog + '.') === 0; })
        || opts.find(function(o) { return /^https?:/.test(o.textContent.trim()) && o.textContent.toLowerCase().indexOf(prog) !== -1; })
        || opts.find(function(o) { return o.textContent.toLowerCase().indexOf(prog) !== -1; });
      var pick = match || opts[0];
      if (!pick) return { error: 'no target option available' };
      sel.value = pick.value;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true, target: pick.textContent.trim().slice(0, 40) };
    })()
  `);
  const tar = targetResult?.value || targetResult;
  if (tar?.error) throw new Error(`Target select failed: ${tar.error}`);
  console.log('  Target:', tar.target);

  // Bug URL
  if (report.bugUrl) {
    const urlResult = await evalInTab(wsUrl, `
      (function() {
        var el = document.querySelector('input[name="submission[bug_url]"]');
        if (!el) return { error: 'bug_url field not found' };
        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(el, ${JSON.stringify(report.bugUrl)});
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return { ok: true };
      })()
    `);
    const ur = urlResult?.value || urlResult;
    if (ur?.error) throw new Error(`Bug URL fill failed: ${ur.error}`);
    console.log('  Bug URL:', report.bugUrl);
  } else {
    console.log('  Bug URL: none in report, skipping');
  }

  // Description textarea — native value setter + input event.
  // MUST be filled BEFORE the VRT selection: the VRT setState triggers a
  // React re-render that resets the textarea to React's state, so the
  // description has to be committed to React state first.
  const descResult = await evalInTab(wsUrl, `
    (function() {
      var el = document.querySelector('textarea[name="submission[description]"], textarea[name="description"], textarea[id*="description"], textarea[name="details"], textarea[name="submission[details]"]');
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
  await new Promise(r => setTimeout(r, 1500)); // let React commit the description

  // VRT dropdown via fiber walk (after description — its re-render preserves it)
  console.log('  Selecting VRT:', report.vrtPath);
  await selectVRT(wsUrl, report.vrtPath);
  await new Promise(r => setTimeout(r, 1500)); // let the VRT re-render flush

  // Terms checkbox — required before submit
  const termsResult = await evalInTab(wsUrl, `
    (function() {
      var el = document.querySelector('input[name="submission[terms_and_conditions]"]');
      if (!el) return { error: 'terms checkbox not found' };
      if (!el.checked) {
        el.click();
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return { ok: true, checked: el.checked };
    })()
  `);
  const trm = termsResult?.value || termsResult;
  if (trm?.error) throw new Error(`Terms check failed: ${trm.error}`);

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
  await navigate(_wsUrl, `https://bugcrowd.com/engagements/${PROGRAM}/submissions/new`);
  await waitLoaded(_wsUrl);
  await new Promise(r => setTimeout(r, 2000)); // let React render

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

  // Let React flush state updates from the fills
  await new Promise(r => setTimeout(r, 2000));

  // Verify form state before submitting; re-fill anything that didn't stick
  const check = await evalInTab(_wsUrl, `JSON.stringify({
    caption: (document.querySelector('input[name="submission[caption]"]')||{}).value,
    vrt: (document.querySelector('input[name="submission[original_vrt_id]"]')||{}).value,
    bugUrl: (document.querySelector('input[name="submission[bug_url]"]')||{}).value,
    descLen: ((document.querySelector('textarea[name="submission[description]"]')||{}).value||'').length,
    terms: (document.querySelector('input[name="submission[terms_and_conditions]"]')||{}).checked
  })`);
  let cv = check?.value || check;
  if (typeof cv === 'string') { try { cv = JSON.parse(cv); } catch (e) {} }
  console.log('Form state before submit:', JSON.stringify(cv));
  if (!cv || !cv.caption || !cv.vrt || !cv.bugUrl || cv.descLen < 100 || !cv.terms) {
    console.log('  Re-filling missing fields...');
    await fillForm(_wsUrl, report);
    await new Promise(r => setTimeout(r, 2000));
    const check2 = await evalInTab(_wsUrl, `JSON.stringify({
      caption: (document.querySelector('input[name="submission[caption]"]')||{}).value,
      vrt: (document.querySelector('input[name="submission[original_vrt_id]"]')||{}).value,
      bugUrl: (document.querySelector('input[name="submission[bug_url]"]')||{}).value,
      descLen: ((document.querySelector('textarea[name="submission[description]"]')||{}).value||'').length,
      terms: (document.querySelector('input[name="submission[terms_and_conditions]"]')||{}).checked
    })`);
    let cv2 = check2?.value || check2;
    if (typeof cv2 === 'string') { try { cv2 = JSON.parse(cv2); } catch (e) {} }
    console.log('Form state after re-fill:', JSON.stringify(cv2));
  }

  // Screenshot after filling
  await doScreenshot(_wsUrl);

  // Submit
  console.log('Submitting...');
  await clickSubmit(_wsUrl);

  // Wait for turnstile solve + submission redirect (up to 20s)
  let submitted = false;
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const st = await evalInTab(_wsUrl, `JSON.stringify({ url: window.location.href, turnstile: (document.querySelector('input[name="cf-turnstile-response"]')||{}).value ? 'SOLVED' : 'EMPTY' })`);
    let sv = st?.value || st;
    if (typeof sv === 'string') { try { sv = JSON.parse(sv); } catch (e) {} }
    const url = (sv && sv.url) || '';
    if (url && !url.includes('/submissions/new')) { submitted = true; break; }
  }
  if (!submitted) {
    // Check for validation errors on the form
    const err = await evalInTab(_wsUrl, `JSON.stringify({ url: window.location.href, errors: Array.from(document.querySelectorAll('.bc-error, .error, [class*="error"]')).map(function(e){return e.textContent.trim().slice(0,120)}).filter(Boolean).slice(0,5), turnstile: (document.querySelector('input[name="cf-turnstile-response"]')||{}).value ? 'SOLVED' : 'EMPTY' })`);
    console.log('Submission did not redirect — form state:', JSON.stringify(err?.value || err));
    throw new Error('Submission did not complete (no redirect from form page)');
  }
  console.log('Submitted ✓ (redirected from form)');

  // Verify
  console.log('Verifying submission...');
  const verification = await verifySubmission(_wsUrl, PROGRAM);
  console.log('Verification:', JSON.stringify(verification));

  // Navigate to submissions list
  await navigate(_wsUrl, `https://bugcrowd.com/submissions?program=${PROGRAM}`);
  await waitLoaded(_wsUrl);
  await new Promise(r => setTimeout(r, 2000));
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
