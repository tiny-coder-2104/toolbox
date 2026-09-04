# TinyCoder PWA Starter Template — Basic

A privacy-first, installable PWA with 5 developer tools. Zero backend, zero tracking. Deploy anywhere.

## What You Get

- **JSON Formatter** — format, validate, minify
- **Base64 Encoder/Decode** — text and binary
- **Regex Tester** — live match highlighting
- **URL Encoder/Decode** — URI and component
- **UUID Generator** — v4 and v1

Plus: dark theme, offline support, mobile-ready, installable as a native app.

## Quick Start

```bash
# 1. Download and unzip
unzip tinycoder-pwa-starter-basic.zip && cd tinycoder-pwa-starter

# 2. Install (requires Node 16)
npm install

# 3. Build for production
npm run build

# 4. Deploy dist/ folder to Vercel, Netlify, or any static host
```

That's it. The `dist/` folder is your deployable app.

## Customize

**Change the app name:**

Edit `public/manifest.json` — update `name` and `short_name` fields.

**Change the theme colors:**

Edit `src/style.css` — modify the CSS custom properties at the top:

```css
:root {
  --bg: #0F172A;        /* background */
  --card-bg: #1E293B;   /* card surface */
  --text: #E2E8F0;       /* body text */
  --accent: #06B6D4;     /* buttons, links, highlights */
  --border: #334155;     /* borders */
}
```

**Change the favicon:**

Replace `public/favicon.png` and `public/icons/icon-192.png` + `icon-512.png`.

## Deploy Checklist

- [ ] Updated `manifest.json` name/description
- [ ] Replaced favicon and icons
- [ ] Adjusted color scheme in `style.css`
- [ ] Built with `npm run build`
- [ ] Tested on mobile (PWA install prompt)
- [ ] Deployed to static host

## Requirements

- Node.js 16+
- Vite 4.5.14 (included in devDependencies)
- Manual PWA setup (no workbox, no plugin)
