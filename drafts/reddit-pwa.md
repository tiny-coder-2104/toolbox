# r/PWA Post Draft

**Title:** How to make any web app installable in 5 minutes (tutorial)

**Body:**

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
