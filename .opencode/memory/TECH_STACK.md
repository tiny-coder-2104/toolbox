# Technology Stack

## Frontend
- **Language**: Vanilla JavaScript (no framework)
- **Build tool**: Vite 4.5.14 (fast, minimal config)
- **PWA setup**: Manual — `manifest.json` + `sw.js` in `public/` dir (vite-plugin-pwa incompatible with Node.js 16 GLIBC)
- **Service worker**: Custom SW with cache-first strategy (install/activate/fetch lifecycle)

## Node.js
- **Version**: v16.20.2 (installed via nvm)
- **Why**: Ubuntu 18.04 has GLIBC 2.27 — Node 18+ requires GLIBC 2.28+
- **nvm**: Used to install Node.js without sudo

## Data Storage
- **IndexedDB** — for any client-side persistence (user preferences, history)
- No backend database

## Hosting & Deployment
- **Vercel** — free tier, automatic HTTPS, Git-triggered auto-deploy on push (user already had account)
- **Domain** — Vercel subdomain (toolbox-lilac-three.vercel.app) initially, custom domain later
- **Live URL** — https://toolbox-lilac-three.vercel.app

## Payments
- **Gumroad** or **LemonSqueezy** — free product listing, handle checkout/delivery
- One-time ($3-5) or subscription ($5/month) model

## Why This Stack
- Zero server costs
- Fastest path from code to live product
- No framework overhead — vanilla JS is sufficient for utility tools
- Vercel handles HTTPS, deploy, and CDN automatically
- Gumroad/LemonSqueezy handles payments without own infrastructure
- Manual PWA chosen over vite-plugin-pwa due to Node 16 ESM compatibility constraints

## Versions Installed
- Node.js 16.20.2 (via nvm)
- npm 8.19.4 (via nvm)
- Vite 4.5.14 (via npm)
- nvm 0.39.7