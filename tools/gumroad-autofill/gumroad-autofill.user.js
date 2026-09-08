// ==UserScript==
// @name         Gumroad Autofill
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Auto-populate Gumroad product fields for TinyCoder PWA Starter Template
// @match        https://gumroad.com/*
// @match        https://app.gumroad.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  /* ── Suggestions Data ─────────────────────────────────────────── */
  var SUGGESTIONS = {
    "title": "Ship Client PWAs in an Afternoon",
    "url_slug": "gyhehh",
    "call_to_action": "i_want_this_prompt",
    "summary": "PWA starter template for freelancers who bill clients. Vanilla JS, zero backend, white-label ready.",
    "description_html": "<p><strong>▶ <a href=\"https://toolbox-lilac-three.vercel.app\" target=\"_blank\">Live Demo — works offline (airplane-mode test)</a> &nbsp;|&nbsp; <a href=\"https://github.com/tiny-coder-2104/toolbox\" target=\"_blank\">Source Code — no black boxes</a> &nbsp;|&nbsp; $0 hosting on Vercel</strong></p>\n<div style=\"border:1px solid #06B6D4;padding:12px;border-radius:8px;margin:16px 0\">\n<h3>Freelancer ROI Calculator</h3>\n<p>Build from scratch: ~25 hrs × $75/hr = $1,875<br>\nWith this template: $29 + ~4 hrs rebrand → deploy to Vercel $0<br>\n<strong>Bill client $2,500 → Profit on first sale: ~$2,171 (86× your $29).</strong> Next client starts with the same foundation — your margin grows.</p>\n<p style=\"font-size:13px;color:#64748B\">Math uses example rates. Your billable rate determines actual profit.</p>\n</div>\n<h2>What This Is</h2><p>A client asks for a simple tool. You have two options: build from scratch, or don't.</p><p>This is a complete PWA template — offline-capable, installable, zero backend — with 5 working dev tools inside. Customize, deploy to Vercel, hand it off. One afternoon, not one weekend.</p><p>No server costs. No database. No vendor lock-in. Just vanilla JS and Vite, deployed for free.</p><p><a href=\"https://toolbox-lilac-three.vercel.app\" target=\"_blank\" rel=\"noopener noreferrer\">Live Demo</a> — works offline. <a href=\"https://github.com/tiny-coder-2104/toolbox\" target=\"_blank\" rel=\"noopener noreferrer\">Source Code</a> — no black boxes.</p><h2>What You Get</h2><table><thead><tr><th>Feature</th><th>Basic ($29)</th><th>Pro ($49)</th><th>Agency License ($79)</th></tr></thead><tbody><tr><td>PWA template source + built output</td><td>Yes</td><td>Yes</td><td>Yes</td></tr><tr><td>README (5-minute setup after Node 16 installed)</td><td>Yes</td><td>Yes</td><td>Yes</td></tr><tr><td>Vercel deploy guide (step-by-step)</td><td>Yes</td><td>Yes</td><td>Yes</td></tr><tr><td>AI Chatbot Prompt Kit (5 industry templates)</td><td>—</td><td>Yes</td><td>Yes</td></tr><tr><td>Customization Guide (rebrand for clients)</td><td>—</td><td>Yes</td><td>Yes</td></tr><tr><td>Commercial License (client use OK)</td><td>—</td><td>—</td><td>Yes</td></tr><tr><td>Client Branding Guide (white-label steps)</td><td>—</td><td>—</td><td>Yes</td></tr><tr><td>Sales Materials (pitch deck, FAQ, pricing sheet)</td><td>—</td><td>—</td><td>Yes</td></tr></tbody></table><h2>Why This Template</h2><ul><li><strong>Offline by default.</strong> PWA with service worker — works without internet, installs on any device. No extra configuration.</li><li><strong>Zero backend.</strong> $0 hosting on Vercel. No databases to manage, no APIs to maintain, no server-side data to protect — pasted tool content never leaves the buyer's browser.</li><li><strong>White-label ready.</strong> Swap the logo, change the colors, rename it. The customization guide walks you through it.</li><li><strong>5 working tools, not a skeleton.</strong> JSON formatter, Base64 encoder, Regex tester, URL encoder, UUID generator — all functional out of the box. Replace them or keep them.</li><li><strong>Instant deploy.</strong> Push to GitHub, connect to Vercel, done. The deploy guide covers every step.</li></ul><h2>Who This Is For</h2><p><strong>Freelance web devs</strong> who need to ship small utility apps or dashboards for clients without rebuilding from scratch every time. You know the drill — client wants \"just a simple tool,\" and suddenly you have a weekend project. This cuts it to an afternoon.</p><p><strong>Agency owners</strong> who want a repeatable product to sell. Buy the Agency License, rebrand it, pitch it as a custom PWA solution. You're not reselling the template — you're selling the finished product with your name on it.</p><p><strong>Solo developers</strong> building side projects or SaaS prototypes. Get a working PWA foundation with routing, offline support, and Vercel deployment already wired up. Skip the boilerplate.</p><h2>Social Proof</h2><ul><li>Live demo at <a href=\"https://toolbox-lilac-three.vercel.app\" target=\"_blank\" rel=\"noopener noreferrer\">toolbox-lilac-three.vercel.app</a> — try it before you buy</li><li>Full source code on <a href=\"https://github.com/tiny-coder-2104/toolbox\" target=\"_blank\" rel=\"noopener noreferrer\">GitHub</a> — no black boxes</li><li>Already deployed and working — this isn't a concept, it's a product</li></ul><h2>FAQ</h2><h3>What's included in the download?</h3><p>Full source code (Vanilla JS + Vite), pre-built dist folder, README with setup instructions, and Vercel deploy guide. Depending on tier, you also get the AI Chatbot Prompt Kit, customization guides, and sales materials.</p><h3>Can I use this for client work?</h3><p>Yes. The Agency License explicitly permits client use. You cannot resell the template itself, but you can build client projects on top of it and charge for the finished product.</p><h3>Do I need Node.js?</h3><p>Yes, for development. You need Node.js 16+ to run the dev server and build the project. Deployment to Vercel is free and requires no local Node setup if you connect directly from GitHub.</p><h3>What if I need help?</h3><p>The README covers common setup issues. For the Pro and Agency tiers, the customization and branding guides are step-by-step. If you hit a real blocker, reach out through Gumroad — I respond.</p><h3>Is this just a code template or a full product?</h3><p>Both. The 5 tools inside are fully functional. You can ship this as-is, or gut the tools and replace them with whatever your client needs. The PWA infrastructure — service worker, offline support, installability, Vercel deployment — is the real value.</p><h2>Get the Template</h2><p>Pick the tier that matches your situation. If you're shipping one client project, Basic covers it. If you want to sell this as a service, go Agency. The Pro tier sits in the middle for devs who want the chatbot kit and customization guide without committing to the agency license.</p><p><strong>Buy once. Deploy forever. No subscriptions.</strong></p><h3>Tier Descriptions:</h3><p><strong>Basic ($29)</strong><br>PWA template source, built output, README, Vercel deploy guide. For devs who need a working PWA and know what to do with it.</p><p><strong>Pro ($49)</strong><br>Everything in Basic plus AI Chatbot Prompt Kit (5 industry templates for e-commerce, healthcare, services, booking, consulting) and Customization Guide. For devs who want to position themselves as the AI-forward choice for client projects.</p><p><strong>Agency License ($79)</strong><br>Everything in Pro plus Commercial License, Client Branding Guide (white-label steps), and Sales Materials (pitch deck, client FAQ, pricing sheet). For agencies and freelancers who want to sell PWAs as a product under their own brand.</p><p><strong>Launch price $29/$49/$79 — increases to $39/$59/$99 after 20 sales.</strong> One-time payment, lifetime access, no subscription. Files delivered as ZIP.</p>\n<p><em>Offline: full offline via service worker. Supports Chrome, Edge, Firefox, Safari 16.4+; Add to Home Screen on Android/iOS. No backend, no database.</em></p>\n",
    "variants": [
      {
        "name": "Basic",
        "price_cents": 2900,
        "price_display": "$29",
        "description": "PWA template, 5 dev tools, README, Vercel deploy guide. Personal use only.",
        "version_label": "Basic",
        "zip_file": "packaging/tinycoder-pwa-starter-basic.zip"
      },
      {
        "name": "Pro",
        "price_cents": 4900,
        "price_display": "$49",
        "description": "Everything in Basic + AI Chatbot Prompt Kit (5 industries) + Customization Guide. Personal use only — upgrade to Agency for commercial client use.",
        "version_label": "Pro",
        "zip_file": "packaging/tinycoder-pwa-starter-pro.zip"
      },
      {
        "name": "Agency License",
        "price_cents": 7900,
        "price_display": "$79",
        "description": "Everything in Pro + Commercial License + Client Branding Guide + Sales Materials (pitch deck, FAQ, pricing sheet). Commercial use: build unlimited client PWAs, no reselling template as-is — see COMMERCIAL-LICENSE.md.",
        "version_label": "Agency License",
        "zip_file": "packaging/tinycoder-pwa-starter-extended.zip"
      }
    ],
    "version_labels": [
      "Basic",
      "Pro",
      "Agency License"
    ],
    "tech_stack": "Vanilla JavaScript + Vite 4.5. HTML5, CSS3. No frameworks.",
    "tools_list": "5 dev utilities: JSON Formatter, Base64 Encoder, Regex Tester, URL Encoder, UUID Generator",
    "backend": "None. Everything runs client-side.",
    "offline": "Full offline support via service worker.",
    "white_label": "No brand marks. All UI elements customizable.",
    "license": "Basic & Pro: personal use only. Agency License: commercial use for client projects — build unlimited client PWAs, no reselling template as-is (see COMMERCIAL-LICENSE.md).",
    "cover_image": "MANUAL_UPLOAD_REQUIRED: 1280x720 navy #0F172A cyan #06B6D4 — see cover_brief",
    "tags": [
      "pwa",
      "pwa template",
      "vanilla js",
      "freelancer",
      "white label",
      "vite",
      "starter template",
      "offline",
      "client work",
      "developer tools"
    ],
    "custom_domain": "tinycoderstudio.gumroad.com/l/gyhehh",
    "category": "Software Development",
    "custom_summary": "Ship client PWAs in an afternoon. Vanilla JS + Vite, offline, $0 Vercel hosting. White-label ready for freelancers.",
    "fine_print": "30-day refund if the README steps (after Node 16 installed) don't get you to a working local build in 5 minutes — deploy time excluded. Reply via Gumroad, no questions asked. One-time payment, lifetime updates for this major version. Basic & Pro: personal use only. Agency: commercial use for client projects (you sell the finished PWA, not the template as-is). Support: reply via Gumroad — typically same-day.",
    "purchase_note": "Thanks — Seth here, TinyCoder. Your ZIP is downloading. Next: unzip → npm install → npm run dev (Node 16+) → edit config.js → push to GitHub → Vercel deploy (free). Reply on Gumroad if stuck — I answer every message. What client project are you building?",
    "cover_brief": "MANUAL 1280x720 navy #0F172A cyan #06B6D4, phone+laptop live demo screenshots, headline 'Ship Client PWAs in an Afternoon', badges '$0 Hosting • Works Offline • White-Label Ready', tier bar '$29 | $49 | $79'"
  }
/* ── Field Definitions ────────────────────────────────────────── */
  // Each field: label text → selector function → value from SUGGESTIONS
  // label text must match exactly what's in the Gumroad page
  var FIELDS = [
    { key: "title",         label: "Name",            type: "input",  section: "product",  needsLoki: false },
    { key: "url_slug",      label: "URL",             type: "input",  section: "product",  needsLoki: false },
    { key: "call_to_action",label: "Call to action",  type: "select", section: "product",  needsLoki: false },
    { key: "summary",       label: "Summary",         type: "input",  section: "product",  needsLoki: false },
    { key: "description",   label: "Description",     type: "tiptap", section: "product",  needsLoki: false },
    { key: "amount",        label: "Amount",          type: "input",  section: "product",  needsLoki: false },
    { key: "version_name",  label: "Name",            type: "input",  section: "version",  needsLoki: false },
    { key: "version_desc",  label: "Description",     type: "textarea",section: "version",  needsLoki: false },
    { key: "version_price", label: "Additional amount",type: "input", section: "version",  needsLoki: false },
    { key: "cover_image",   label: "Upload",          type: "file",   section: "product",  needsLoki: true  },
    { key: "fine_print",    label: "Fine print (optional)", type: "input", section: "product", needsLoki: false },
    { key: "tags",          label: "Tags",            type: "input",  section: "product",  needsLoki: false },
  ];

  /* ── Helpers ──────────────────────────────────────────────────── */
  function findByLabel(text) {
    var labels = document.querySelectorAll('label');
    for (var i = 0; i < labels.length; i++) {
      if (labels[i].textContent.trim() === text) {
        var forId = labels[i].getAttribute('for');
        if (forId) return document.getElementById(forId);
      }
    }
    return null;
  }

  function findInSection(text, sectionClass) {
    var sections = document.querySelectorAll('section');
    for (var s = 0; s < sections.length; s++) {
      if (sections[s].textContent.indexOf(text) !== -1) {
        var labels = sections[s].querySelectorAll('label');
        for (var i = 0; i < labels.length; i++) {
          if (labels[i].textContent.trim() === text) {
            var forId = labels[i].getAttribute('for');
            if (forId) return document.getElementById(forId);
          }
        }
      }
    }
    return null;
  }

  function setValue(el, value) {
    if (!el) return false;
    try {
      if (el.tagName === 'SELECT') {
        el.value = value;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('input', { bubbles: true }));
      } else if (el.type === 'file') {
        // File inputs cannot be auto-populated
        return false;
      } else if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
        el.value = value;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  function setTiptapContent(html) {
    var editor = document.querySelector('div.tiptap[contenteditable="true"]');
    if (!editor) {
      // Fallback: try by aria-label
      editor = document.querySelector('[aria-label="Description"]');
    }
    if (!editor) return false;
    try {
      editor.innerHTML = html;
      editor.focus();
      editor.dispatchEvent(new Event('input', { bubbles: true }));
      editor.dispatchEvent(new Event('blur', { bubbles: true }));
      // Also dispatch on the parent form if any
      var form = editor.closest('form');
      if (form) {
        form.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  function setAmount(cents) {
    var amountInput = findByLabel("Amount");
    if (amountInput) {
      amountInput.value = cents;
      amountInput.dispatchEvent(new Event('input', { bubbles: true }));
      amountInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    // Also set suggested price
    var suggestedInput = document.getElementById(':r57:-suggested-price-cents');
    if (suggestedInput) {
      suggestedInput.value = cents;
      suggestedInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  /* ── Panel UI ─────────────────────────────────────────────────── */
  var panel = null;
  var dryRun = false;
  var statusLog = [];

  function log(msg, type) {
    type = type || 'info';
    var ts = new Date().toLocaleTimeString();
    statusLog.push({ ts: ts, msg: msg, type: type });
    if (panel) {
      var logEl = panel.querySelector('.autofill-log');
      if (logEl) {
        logEl.innerHTML = statusLog.map(function (s) {
          return '<div class="autofill-log-' + s.type + '">[' + s.ts + '] ' + s.msg + '</div>';
        }).join('');
        logEl.scrollTop = logEl.scrollHeight;
      }
    }
  }

  function buildPanel() {
    if (panel) return;

    var style = document.createElement('style');
    style.textContent =
      '.autofill-panel{position:fixed;top:10px;right:10px;width:380px;max-height:80vh;overflow-y:auto;' +
      'background:#1a1a2e;color:#eee;border:1px solid #333;border-radius:12px;' +
      'font-family:system-ui,-apple-system,sans-serif;font-size:13px;z-index:99999;' +
      'box-shadow:0 8px 32px rgba(0,0,0,0.5);padding:16px;}' +
      '.autofill-panel h3{margin:0 0 12px;font-size:15px;color:#ff90e8;}' +
      '.autofill-panel label{display:flex;align-items:center;gap:6px;margin:4px 0;cursor:pointer;}' +
      '.autofill-panel input[type=checkbox]{accent-color:#ff90e8;}' +
      '.autofill-panel select{background:#2a2a4e;color:#eee;border:1px solid #444;border-radius:6px;padding:4px;}' +
      '.autofill-panel button{background:#ff90e8;color:#1a1a2e;border:none;border-radius:6px;' +
      'padding:8px 16px;font-weight:bold;cursor:pointer;margin:4px 2px 0;}' +
      '.autofill-panel button:hover{background:#ffb8f0;}' +
      '.autofill-panel button:disabled{opacity:0.4;cursor:not-allowed;}' +
      '.autofill-panel .autofill-log{margin-top:8px;max-height:200px;overflow-y:auto;' +
      'background:#0d0d1a;border-radius:6px;padding:8px;font-size:11px;}' +
      '.autofill-log-info{color:#aaa;}' +
      '.autofill-log-success{color:#4ade80;}' +
      '.autofill-log-error{color:#f87171;}' +
      '.autofill-log-warn{color:#fbbf24;}' +
      '.autofill-panel .needs-loki{color:#fbbf24;font-style:italic;}' +
      '.autofill-panel .section-title{font-weight:bold;color:#ff90e8;margin:8px 0 4px;font-size:12px;}' +
      '.autofill-panel .variant-info{color:#4ade80;font-size:12px;margin:4px 0;}' +
      '.autofill-panel .close-btn{position:absolute;top:8px;right:12px;background:none;border:none;' +
      'color:#888;font-size:18px;cursor:pointer;}' +
      '.autofill-panel .close-btn:hover{color:#fff;}';
    document.head.appendChild(style);

    panel = document.createElement('div');
    panel.className = 'autofill-panel';
    panel.innerHTML =
      '<button class="close-btn" id="autofill-close">&times;</button>' +
      '<h3>TinyCoder Autofill</h3>' +
      '<div class="variant-info" id="autofill-variant"></div>' +
      '<div id="autofill-fields"></div>' +
      '<div style="margin-top:12px;">' +
      '  <button id="autofill-fill">Fill All</button>' +
      '  <button id="autofill-dryrun">Dry Run</button>' +
      '  <button id="autofill-clear">Clear Log</button>' +
      '</div>' +
      '<div class="autofill-log" id="autofill-log"></div>';

    document.body.appendChild(panel);

    // Build field checkboxes
    var fieldsContainer = panel.querySelector('#autofill-fields');
    var variantContainer = panel.querySelector('#autofill-variant');

    // Variant selector
    var variantSelect = document.createElement('select');
    variantSelect.id = 'autofill-variant-select';
    SUGGESTIONS.variants.forEach(function (v, i) {
      var opt = document.createElement('option');
      opt.value = i;
      opt.textContent = v.name + ' (' + v.price_display + ')';
      variantSelect.appendChild(opt);
    });
    variantContainer.appendChild(variantSelect);

    // Field checkboxes
    FIELDS.forEach(function (field) {
      var lbl = document.createElement('label');
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !field.needsLoki;
      cb.dataset.key = field.key;
      if (field.needsLoki) {
        cb.disabled = true;
        cb.title = 'Needs @loki to fill';
      }
      lbl.appendChild(cb);
      var span = document.createElement('span');
      if (field.needsLoki) {
        span.className = 'needs-loki';
        span.textContent = field.label + ' (NEEDS_LOKI)';
      } else {
        span.textContent = field.label;
      }
      lbl.appendChild(span);
      fieldsContainer.appendChild(lbl);
    });

    // Event listeners
    panel.querySelector('#autofill-close').addEventListener('click', function () {
      panel.style.display = 'none';
    });

    panel.querySelector('#autofill-fill').addEventListener('click', function () {
      dryRun = false;
      fillAll();
    });

    panel.querySelector('#autofill-dryrun').addEventListener('click', function () {
      dryRun = true;
      fillAll();
    });

    panel.querySelector('#autofill-clear').addEventListener('click', function () {
      statusLog = [];
      log('Log cleared.', 'info');
    });

    variantSelect.addEventListener('change', function () {
      updateVariantInfo();
    });

    updateVariantInfo();
    log('Panel ready. Select variant and click Fill or Dry Run.', 'info');
  }

  function updateVariantInfo() {
    var idx = parseInt(document.querySelector('#autofill-variant-select').value);
    var v = SUGGESTIONS.variants[idx];
    var el = document.querySelector('#autofill-variant');
    if (el && v) {
      el.textContent = v.name + ' — ' + v.price_display + ': ' + v.description;
    }
  }

  function getSelectedVariant() {
    var idx = parseInt(document.querySelector('#autofill-variant-select').value);
    return SUGGESTIONS.variants[idx] || SUGGESTIONS.variants[0];
  }

  function getCheckedFields() {
    var checks = document.querySelectorAll('#autofill-fields input[type=checkbox]');
    var keys = [];
    checks.forEach(function (cb) {
      if (cb.checked) keys.push(cb.dataset.key);
    });
    return keys;
  }

  function fillAll() {
    var variant = getSelectedVariant();
    var keys = getCheckedFields();
    var count = 0;

    log('[' + (dryRun ? 'DRY RUN' : 'FILL') + '] Starting...', 'info');
    log('Variant: ' + variant.name + ' (' + variant.price_display + ')', 'info');

    keys.forEach(function (key) {
      var field = FIELDS.find(function (f) { return f.key === key; });
      if (!field) return;

      if (field.needsLoki) {
        log(field.label + ': SKIPPED (NEEDS_LOKI)', 'warn');
        return;
      }

      var success = false;
      var value = '';

      switch (key) {
        case 'title':
          value = SUGGESTIONS.title;
          success = setValue(findByLabel(field.label), value);
          break;
        case 'url_slug':
          value = SUGGESTIONS.url_slug;
          success = setValue(findByLabel(field.label), value);
          break;
        case 'call_to_action':
          value = SUGGESTIONS.call_to_action;
          success = setValue(findByLabel(field.label), value);
          break;
        case 'summary':
          value = SUGGESTIONS.summary;
          success = setValue(findByLabel(field.label), value);
          break;
        case 'description':
          value = SUGGESTIONS.description_html;
          success = setTiptapContent(value);
          break;
        case 'amount':
          value = String(variant.price_cents);
          success = setValue(findByLabel(field.label), value);
          if (success) setAmount(variant.price_cents);
          break;
        case 'version_name':
          value = variant.version_label;
          success = setValue(findInSection('Versions', 'version'), value);
          break;
        case 'version_desc':
          value = variant.description;
          success = setValue(findInSection('Versions', 'version'), value);
          break;
        case 'version_price':
          value = String(variant.price_cents);
          success = setValue(findInSection('Versions', 'version'), value);
          break;
        case 'cover_image':
          log('Cover image: MANUAL upload required', 'warn');
          return;
        case 'fine_print':
           value = SUGGESTIONS.fine_print;
           success = setValue(findByLabel('Fine print (optional)'), value);
           break;
        case 'category':
           // Category is a select in Discover section — try label 'Category'
           value = SUGGESTIONS.category;
           var catEl = findByLabel('Category') || document.querySelector('select[name="category"]');
           success = catEl ? setValue(catEl, value) : false;
           break;
        case 'tags':
          log('Tags: NEEDS_LOKI — not found in current DOM', 'warn');
          return;
      }

      if (success) {
        log(key + ': ' + (dryRun ? 'WOULD SET' : 'SET') + ' → ' + (value.length > 40 ? value.slice(0, 40) + '...' : value), 'success');
        count++;
      } else {
        log(key + ': FAILED to find element', 'error');
      }
    });

    log('Done. ' + count + ' fields ' + (dryRun ? 'would be ' : '') + 'filled.', dryRun ? 'warn' : 'success');
  }

  /* ── Init ─────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildPanel);
  } else {
    buildPanel();
  }
})();
