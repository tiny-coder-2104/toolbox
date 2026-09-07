import './style.css'

// UTM Convention:
// utm_source = platform (reddit, devto, github, twitter)
// utm_medium = content type (free_tool, post, comment, bio)
// utm_campaign = initiative (lead_gen_2026, seo_content, community)
// Example: ?utm_source=reddit&utm_medium=free_tool&utm_campaign=lead_gen_2026

const GUMROAD_URL = 'https://tinycoderstudio.gumroad.com/l/gyhehh'
const GUMROAD_UTM = '?utm_source=toolbox&utm_medium=free_tool&utm_campaign=lead_gen_2026'
const GA_MEASUREMENT_ID = 'G-VF1WRGBKM5'

function gtag(event, params) {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event, ...params })
}

function gumroadUrl() { return GUMROAD_URL + GUMROAD_UTM }

function trackToolUse(toolId) {
  gtag('tool_use', { tool: toolId, tool_category: 'dev_tool' })
}

function trackChatbotOpen() { gtag('chatbot_open') }
function trackChatbotMessage() { gtag('chatbot_message') }
function trackGumroadClick() { gtag('gumroad_click', { method: 'cta' }) }

const getApp = () => document.getElementById('app')

const TOOLS = {
  json: { title: 'JSON Formatter', desc: 'Format, validate, and minify JSON', icon: '{}' },
  base64: { title: 'Base64 Encoder', desc: 'Encode and decode Base64 strings', icon: 'B64' },
  regex: { title: 'Regex Tester', desc: 'Test regular expressions with live highlights', icon: '.*' },
  url: { title: 'URL Encoder', desc: 'Encode and decode URLs', icon: 'URL' },
  uuid: { title: 'UUID Generator', desc: 'Generate UUIDs instantly', icon: 'Ux' }
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function base64Encode(str) {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk))
  }
  return btoa(bin)
}

function base64Decode(b64) {
  const bin = atob(b64.replace(/\s/g, ''))
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function homeView() {
  return `
    <header>
      <h1>TinyCoder</h1>
      <p>Web Toolbox — developer utilities in your browser</p>
      <span class="social-proof">100+ developers use TinyCoder</span>
      <div class="trust-badges">
        <span>✓ Works Offline</span>
        <span>✓ No Backend Required</span>
        <span>✓ 30-Day Refund</span>
      </div>
    </header>
    <main>
      <section class="tools">
        ${Object.entries(TOOLS).map(([id, t]) => `
          <div class="tool-card" data-tool="${id}">
            <span class="tool-icon">${esc(t.icon)}</span>
            <h2>${esc(t.title)}</h2>
            <p>${esc(t.desc)}</p>
          </div>
        `).join('')}
      </section>
    </main>
    <footer>
      <p>Privacy-first. Client-side only. Zero backend.</p>
    </footer>
    <div id="tool-cta-slot"></div>
}

function toolView(id) {
  const t = TOOLS[id]
  if (!t) return homeView()
  return `
    <header class="tool-header">
      <button class="back-btn" id="back-btn">← Back</button>
      <h1>${esc(t.title)}</h1>
      <p>${esc(t.desc)}</p>
    </header>
    <main class="tool-main" id="tool-main">
      ${toolBody(id)}
    </main>
    <div class="tool-cta" data-tool="${id}">
      <p>Need the full 5-tool PWA starter? <a href="${gumroadUrl()}" target="_blank" rel="noopener" data-gumroad>Get it for $29</a></p>
    </div>
    <footer>
      <p>Privacy-first. Client-side only. Zero backend.</p>
    </footer>
  `
}

function toolBody(id) {
  switch (id) {
    case 'json': return jsonBody()
    case 'base64': return base64Body()
    case 'regex': return regexBody()
    case 'url': return urlBody()
    case 'uuid': return uuidBody()
    default: return ''
  }
}

function jsonBody() {
  return `
    <div class="tool-bar">
      <button data-act="format">Format</button>
      <button data-act="minify">Minify</button>
      <button data-act="validate">Validate</button>
    </div>
    <textarea id="json-in" rows="12" placeholder='Paste JSON here, e.g. {"a":1,"b":[2,3]}'></textarea>
    <div class="output-wrap">
      <textarea id="json-out" rows="12" readonly placeholder="Output appears here"></textarea>
      <button class="copy-btn" data-target="json-out">Copy</button>
    </div>
  `
}

function base64Body() {
  return `
    <div class="tool-bar">
      <button data-act="encode">Encode</button>
      <button data-act="decode">Decode</button>
    </div>
    <textarea id="b64-in" rows="8" placeholder="Text or Base64 to process"></textarea>
    <div class="output-wrap">
      <output id="b64-out" class="out-box">Result appears here</output>
      <button class="copy-btn" data-target="b64-out">Copy</button>
    </div>
  `
}

function regexBody() {
  return `
    <div class="field">
      <label>Pattern</label>
      <input id="rx-pattern" placeholder="e.g. \\d+" />
    </div>
    <div class="field">
      <label>Flags</label>
      <input id="rx-flags" placeholder="gimsuy" maxlength="5" />
    </div>
    <textarea id="rx-text" rows="8" placeholder="Text to test against"></textarea>
    <div class="output-wrap">
      <div id="rx-result" class="out-box">Matches appear here with count</div>
    </div>
  `
}

function urlBody() {
  return `
    <div class="tool-bar">
      <button data-act="encode">Encode</button>
      <button data-act="decode">Decode</button>
      <button data-act="component">Encode Component</button>
      <button data-act="componentDecode">Decode Component</button>
    </div>
    <textarea id="url-in" rows="8" placeholder="URL or text to process"></textarea>
    <div class="output-wrap">
      <output id="url-out" class="out-box">Result appears here</output>
      <button class="copy-btn" data-target="url-out">Copy</button>
    </div>
  `
}

function uuidBody() {
  return `
    <div class="tool-bar">
      <button data-act="v4">Generate UUID v4</button>
      <button data-act="v1">Generate UUID v1</button>
      <button data-act="many">Generate 10</button>
    </div>
    <div class="output-wrap">
      <output id="uuid-out" class="out-box uuid-out">Click a button to generate UUIDs</output>
      <button class="copy-btn" data-target="uuid-out">Copy</button>
    </div>
  `
}

function uuidv4() {
  if (crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function uuidv1() {
  const now = new Date().getTime()
  const timeHex = (now + 0x01b21dd213814000).toString(16).padStart(12, '0')
  const fields = [
    timeHex.slice(9, 12) + timeHex.slice(6, 9),
    timeHex.slice(3, 6),
    '1' + timeHex.slice(0, 3),
    '8' + Math.floor(Math.random() * 0x3fff).toString(16).padStart(3, '0'),
    Math.floor(Math.random() * 0xffffffffffff).toString(16).padStart(12, '0')
  ]
  return fields.join('-')
}

function render() {
  const app = getApp()
  if (!app) return // DOM not ready yet
  const hash = location.hash.replace(/^#\/?/, '')
  const [id] = hash.split('/')
  app.innerHTML = id && TOOLS[id] ? toolView(id) : homeView()

  const backBtn = document.getElementById('back-btn')
  if (backBtn) backBtn.addEventListener('click', () => { location.hash = '' })

  document.querySelectorAll('.tool-card').forEach(card => {
    card.addEventListener('click', () => {
      trackToolUse(card.dataset.tool)
      location.hash = '/' + card.dataset.tool
    })
  })

  document.querySelectorAll('[data-gumroad]').forEach(a => {
    a.addEventListener('click', trackGumroadClick)
  })

  const main = document.getElementById('tool-main')
  if (main) wireTool(id, main)

  const toolCtaSlot = document.getElementById('tool-cta-slot')
  if (toolCtaSlot && id && TOOLS[id]) {
    const count = (parseInt(localStorage.getItem('tc_tool_uses') || '0')) + 1
    localStorage.setItem('tc_tool_uses', count)
    if (count >= 3 && !localStorage.getItem('tc_cta_dismissed')) {
      toolCtaSlot.innerHTML = `<div class="cta-banner"><p>Used a tool? <a href="${gumroadUrl()}" target="_blank" rel="noopener" data-gumroad>Get the full PWA template for $29</a></p><button class="cta-dismiss">✕</button></div>`
      toolCtaSlot.querySelector('.cta-dismiss').addEventListener('click', () => {
        localStorage.setItem('tc_cta_dismissed', '1')
        toolCtaSlot.innerHTML = ''
      })
      toolCtaSlot.querySelector('[data-gumroad]').addEventListener('click', trackGumroadClick)
    }
  }
}

function wireTool(id, main) {
  if (id === 'json') {
    const inEl = main.querySelector('#json-in')
    const outEl = main.querySelector('#json-out')
    main.querySelectorAll('button[data-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        trackToolUse(id)
        const raw = inEl.value
        let parsed
        try { parsed = JSON.parse(raw) } catch (e) {
          outEl.value = 'Invalid JSON: ' + e.message; return
        }
        const act = btn.dataset.act
        if (act === 'format') outEl.value = JSON.stringify(parsed, null, 2)
        else if (act === 'minify') outEl.value = JSON.stringify(parsed)
        else outEl.value = 'Valid JSON ✓'
      })
    })
  }

  if (id === 'base64') {
    const inEl = main.querySelector('#b64-in')
    const outEl = main.querySelector('#b64-out')
    main.querySelectorAll('button[data-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        trackToolUse(id)
        const v = inEl.value
        if (!v) { outEl.textContent = 'Enter some input first'; return }
        try {
          outEl.textContent = btn.dataset.act === 'encode'
            ? base64Encode(v)
            : base64Decode(v)
        } catch (e) {
          outEl.textContent = 'Error: ' + e.message
        }
      })
    })
  }

  if (id === 'regex') {
    const patternEl = main.querySelector('#rx-pattern')
    const flagsEl = main.querySelector('#rx-flags')
    const textEl = main.querySelector('#rx-text')
    const resultEl = main.querySelector('#rx-result')
    const run = () => {
      let pattern, flags
      try { pattern = new RegExp(patternEl.value, flagsEl.value) }
      catch (e) { resultEl.innerHTML = '<span class="err">' + esc(e.message) + '</span>'; return }
      flags = flagsEl.value
      const text = textEl.value
      const isGlobal = flags.includes('g')
      const matches = []
      let m
      const local = isGlobal ? new RegExp(pattern.source, flags) : pattern
      while ((m = local.exec(text)) !== null) {
        matches.push(m[0])
        if (!isGlobal) break
        if (m[0] === '') local.lastIndex++
      }
      resultEl.textContent = matches.length + ' match' + (matches.length === 1 ? '' : 'es')
      if (matches.length) {
        resultEl.textContent += ': ' + matches.slice(0, 20).map(x => JSON.stringify(x)).join(', ')
        if (matches.length > 20) resultEl.textContent += '…'
      }
    }
    ;[patternEl, flagsEl, textEl].forEach(el => el.addEventListener('input', run))
  }

  if (id === 'url') {
    const inEl = main.querySelector('#url-in')
    const outEl = main.querySelector('#url-out')
    main.querySelectorAll('button[data-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        trackToolUse(id)
        const act = btn.dataset.act
        const v = inEl.value
        try {
          if (act === 'encode') outEl.textContent = encodeURI(v)
          else if (act === 'decode') outEl.textContent = decodeURI(v)
          else if (act === 'component') outEl.textContent = encodeURIComponent(v)
          else outEl.textContent = decodeURIComponent(v)
        } catch (e) {
          outEl.textContent = 'Error: ' + e.message
        }
      })
    })
  }

  if (id === 'uuid') {
    const outEl = main.querySelector('#uuid-out')
    main.querySelectorAll('button[data-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        trackToolUse(id)
        const act = btn.dataset.act
        let guids
        if (act === 'v4') guids = [uuidv4()]
        else if (act === 'v1') guids = [uuidv1()]
        else guids = Array.from({ length: 10 }, () => uuidv4())
        outEl.textContent = guids.join('\n')
      })
    })
  }

  main.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = main.querySelector('#' + btn.dataset.target)
      const text = (target && (target.value || target.textContent) || '').trim()
      if (!text) return
      navigator.clipboard.writeText(text).then(() => {
        const old = btn.textContent
        btn.textContent = 'Copied ✓'
        setTimeout(() => { btn.textContent = old }, 1200)
      })
    })
  })
}

window.addEventListener('hashchange', render)
render()

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(() => {
      console.log('Service Worker registered')
    }).catch((err) => {
      console.log('Service Worker registration failed:', err)
    })
  })
}

// Exit-Intent Popup
(function() {
  let shown = false
  document.addEventListener('mousemove', e => {
    if (shown || sessionStorage.getItem('tc_exit_shown')) return
    if (e.clientY < 5) {
      shown = true
      sessionStorage.setItem('tc_exit_shown', '1')
      const overlay = document.createElement('div')
      overlay.id = 'exit-modal'
      overlay.innerHTML = `
        <div class="exit-card">
          <button class="exit-close" id="exit-close">✕</button>
          <h2>Ship client PWAs in an afternoon</h2>
          <p>Free JSON Formatter included. Full 5-tool template → $29</p>
          <a href="${gumroadUrl()}" target="_blank" rel="noopener" class="exit-cta" data-gumroad>Get the Template</a>
        </div>
      `
      document.body.appendChild(overlay)
      overlay.addEventListener('click', e => {
        if (e.target === overlay || e.target.id === 'exit-close' || e.target.closest('.exit-close')) {
          overlay.remove()
        }
      })
      document.addEventListener('keydown', function handler(e) {
        if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', handler) }
      })
      overlay.querySelector('[data-gumroad]').addEventListener('click', trackGumroadClick)
    }
  })
})()

// Sticky CTA Bar
(function() {
  if (localStorage.getItem('tc_sticky_dismissed')) return
  const bar = document.createElement('div')
  bar.id = 'sticky-cta'
  bar.innerHTML = `
    <span>🛠️ Free PWA Tools → Full Template $29</span>
    <a href="${gumroadUrl()}" target="_blank" rel="noopener" data-gumroad>Get It</a>
    <button id="sticky-dismiss">✕</button>
  `
  document.body.appendChild(bar)
  bar.querySelector('#sticky-dismiss').addEventListener('click', () => {
    localStorage.setItem('tc_sticky_dismissed', '1')
    bar.remove()
  })
  bar.querySelector('[data-gumroad]').addEventListener('click', trackGumroadClick)
})()

// Chatbot event tracking
(function() {
  let chatOpen = false
  const obs = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(n => {
        if (n.nodeType === 1) {
          if (!chatOpen && n.textContent && n.textContent.includes('chat')) {
            chatOpen = true
            trackChatbotOpen()
          }
          if (n.textContent && n.textContent.trim().length > 0) {
            trackChatbotMessage()
          }
        }
      })
    })
  })
  obs.observe(document.body, { childList: true, subtree: true })
})()

// Lead capture - intercept chat and POST to Make.com webhook
(function() {
  const WEBHOOK = 'https://hook.us2.make.com/wgwq68459cpjed3h7is6onuf026q23cx'
  const seen = new Set()
  function extractEmail(t) { const m = t.match(/[\w.+-]+@[\w-]+\.[\w.-]+/); return m ? m[0] : '' }
  function extractName(t) {
    const p = [/(?:my name is|i'm|i am|call me|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i, /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)$/]
    for (const r of p) { const m = t.match(r); if (m) return m[1] }
    return ''
  }
  function sendLead(d) {
    const body = JSON.stringify({ name: d.name||'', email: d.email||'', company: d.company||'', message: d.message||'', source: 'chatbase' })
    if (navigator.sendBeacon) navigator.sendBeacon(WEBHOOK, new Blob([body], {type:'application/json'}))
    else fetch(WEBHOOK, {method:'POST', headers:{'Content-Type':'application/json'}, body, mode:'no-cors'})
  }
  function processMsg(text) {
    if (!text || text.length < 3 || seen.has(text)) return
    seen.add(text)
    if (seen.size > 100) seen.clear()
    const email = extractEmail(text)
    const name = extractName(text)
    const cm = text.match(/(?:company|org|organization|business|firm|from)\s+(?:is\s+)?([A-Z][\w\s&.]+)/i)
    const company = cm ? cm[1].trim() : ''
    if (email || name || company) sendLead({name, email, company, message: text})
  }
  function observeChat() {
    const obs = new MutationObserver(mutations => {
      mutations.forEach(m => m.addedNodes.forEach(n => {
        if (n.nodeType === 1 && n.textContent) processMsg(n.textContent.trim())
      }))
    })
    obs.observe(document.body, {childList: true, subtree: true})
  }
  window.addEventListener('load', () => setTimeout(observeChat, 3000))
})();

// Chatbase AI Chatbot - Load after DOM ready
(function(){
  if(!window.chatbase||window.chatbase("getState")!=="initialized"){
    window.chatbase=function(){
      if(!window.chatbase.q){window.chatbase.q=[]}
      window.chatbase.q.push([].slice.call(arguments))
    };
    window.chatbase=new Proxy(window.chatbase,{
      get(target,prop){
        if(prop==="q"){return target.q}
        return(...args)=>target(prop,...args)
      }
    })
  }
  const onLoad=function(){
    const script=document.createElement("script");
    script.src="https://www.chatbase.co/embed.min.js";
    script.id="u-Y9MHASFos_xwosYW3Eo";
    script.domain="www.chatbase.co";
    document.body.appendChild(script)
  };
  if(document.readyState==="complete"){onLoad()}
  else{window.addEventListener("load",onLoad)}
})();
