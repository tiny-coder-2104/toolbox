# Manual Posting Guide

## Reddit r/SideProject

**Go to:** https://www.reddit.com/r/SideProject/submit

**Title:**
```
I packaged 5 dev tools into one PWA and sold it as a template
```

**Body (copy-paste):**
```
Hey r/SideProject,

I built a Progressive Web App with 5 offline dev tools — JSON Formatter, Base64 Encoder, Regex Tester, URL Encoder, and UUID Generator — and packaged it as a starter template for freelance web devs.

**What it does:**
- All tools work offline (service worker cached)
- Installs to home screen like a native app
- Dark theme, responsive, works on any device
- Config-driven — change app name and colors in one file

**Why I built it:**
I was tired of browser extensions that track you and stop working offline. Wanted something clean, private, and installable.

**Tech stack:**
- Vanilla JavaScript (zero dependencies)
- HTML/CSS
- Service Worker + manifest.json
- Deployed on Vercel

**Revenue model:**
Selling the starter template on Gumroad for $29. The free tools drive traffic, the template converts.

**What I learned:**
- PWAs are underrated for freelance work
- Clients love the "install on home screen" demo
- Offline-first is a selling point, not a feature

**Links:**
- Live demo: https://toolbox-lilac-three.vercel.app
- Source: https://github.com/tiny-coder-2104/toolbox
- Gumroad: https://tinycoderstudio.gumroad.com/l/gyhehh

Happy to answer any questions about the build process or revenue strategy.
```

---

## Reddit r/PWA

**Go to:** https://www.reddit.com/r/PWA/submit

**Title:**
```
How to make any web app installable in 5 minutes (tutorial)
```

**Body (copy-paste):**
```
I've been building PWAs for freelance clients and the install prompt is the moment they "get it." Here's the minimal setup:

**Step 1: manifest.json**
```json
{
  "name": "Your App",
  "short_name": "App",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0F172A",
  "theme_color": "#06B6D4",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Step 2: Service Worker**
```js
const CACHE = 'v1';
const ASSETS = ['/', '/index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
```

**Step 3: Register**
```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

**Step 4: Test**
1. Deploy to HTTPS host
2. Open Chrome on Android
3. Three-dot menu → "Add to Home Screen"

That's it. Your app is installable.

**Why this matters for freelancers:**
- Clients want "an app" but hate the $20k+ price tag
- PWAs give them home screen icon, offline support, no Play Store fees
- You can build and deploy in an afternoon

I wrote a longer tutorial here: https://toolbox-lilac-three.vercel.app/blog/pwa-installable-android.html

Happy to answer questions about PWA development.
```

---

## Reddit r/IMadeThis

**Go to:** https://www.reddit.com/r/IMadeThis/submit

**Title:**
```
I made 5 offline dev tools in one PWA
```

**Body (copy-paste):**
```
Built a Progressive Web App with 5 developer tools that work offline:

1. **JSON Formatter** — prettify/minify JSON
2. **Base64 Encoder/Decoder** — encode strings and files
3. **Regex Tester** — test patterns with real-time matching
4. **URL Encoder/Decoder** — encode URLs and query parameters
5. **UUID Generator** — generate v4 UUIDs

**Features:**
- Works offline (service worker)
- Installs to home screen
- Dark theme
- No tracking, no extensions needed

**Tech:** Vanilla JS, HTML/CSS, zero dependencies.

**Live demo:** https://toolbox-lilac-three.vercel.app

**Source:** https://github.com/tiny-coder-2104/toolbox

Built it because I was tired of browser extensions that track you and stop working offline. Figured other devs might find it useful too.
```

---

## Twitter/X Thread

**Tweet 1 (Hook):**
```
I built 5 offline dev tools in one PWA.

No dependencies. No tracking. No browser extensions.

Just HTML, CSS, and JavaScript.

Here's the stack and what I learned 🧵
```

**Tweet 2 (Tools):**
```
The tools:

• JSON Formatter — prettify/minify
• Base64 Encoder/Decoder
• Regex Tester — real-time matching
• URL Encoder/Decoder
• UUID Generator — v4

All work offline. All install to home screen.
```

**Tweet 3 (Stack):**
```
Tech stack:

• Vanilla JavaScript (zero deps)
• Service Worker for offline caching
• manifest.json for installability
• CSS custom properties for theming
• Deployed on Vercel

Total size: under 10KB gzipped.
```

**Tweet 4 (Install):**
```
Making a PWA installable takes 3 files:

1. manifest.json — app metadata + icons
2. sw.js — service worker for caching
3. One line to register the worker

That's it. No React. No Next.js. No build step.
```

**Tweet 5 (PWA vs Native):**
```
Why PWAs win for freelance work:

• Clients want "an app" but hate $20k+ price tags
• PWAs give home screen icon + offline support
• No Play Store fees or approval process
• You build in days, not months
```

**Tweet 6 (Demo):**
```
Live demo: https://toolbox-lilac-three.vercel.app

Try it on your phone → three-dot menu → "Add to Home Screen"

That's the moment clients get it.
```

**Tweet 7 (CTA):**
```
I'm selling the starter template on Gumroad for $29.

Config-driven — change app name and colors in one file.

Deploy to Vercel in minutes.

Link: https://tinycoderstudio.gumroad.com/l/gyhehh

Happy to answer questions.
```

---

## Dev.to (Already Published!)

First article published: https://dev.to/tinycoder-studio/vanilla-javascript-pwa-tutorial-build-with-zero-dependencies-1cpj

**Remaining 3 articles to import:**
1. https://toolbox-lilac-three.vercel.app/blog/pwa-installable-android.html
2. https://toolbox-lilac-three.vercel.app/blog/pwa-vs-native-app.html
3. https://toolbox-lilac-three.vercel.app/blog/json-formatter-offline.html

**Process:** Go to https://dev.to/new → Import from URL → Enter URL → Add tags: `javascript`, `webdev`, `tutorial`, `pwa` → Publish
