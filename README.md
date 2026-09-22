# TinyCoder — PWA Starter Template for Freelancers

**Ship client PWAs in an afternoon. Offline-capable, installable, zero backend.**

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftiny-coder-2104%2Ftoolbox&project-name=toolbox&repository-name=toolbox)

▶ **Live Demo (works offline):** [toolbox-lilac-three.vercel.app](https://toolbox-lilac-three.vercel.app)

⬇ **Free Tool (JSON Formatter):** [Gumroad $0+ download](https://tinycoderstudio.gumroad.com/l/pwa-json-formatter)

✦ **Full PWA Template:** $29

---

## What Is This?

A complete PWA template with 5 working dev tools inside. Customize, deploy to Vercel, hand it off. One afternoon, not one weekend.

- **Offline by default** — PWA with service worker, works without internet
- **Zero backend** — $0 hosting on Vercel, no databases, no APIs
- **White-label ready** — swap logo, change colors, rename it
- **5 working tools** — JSON formatter, Base64 encoder, Regex tester, URL encoder, UUID generator

---

## Live Demo

**[toolbox-lilac-three.vercel.app](https://toolbox-lilac-three.vercel.app)**

Try it. Turn on airplane mode. Refresh. Still works. This is a fully functional PWA — installable on any device, offline-capable, and powered entirely by client-side JavaScript. No server. No API keys. No monthly bills.

The demo is deployed on Vercel's free tier with a global CDN, automatic SSL, and a service worker that caches every asset for offline use. It is the exact same build you get when you purchase the template.

---

## Free JSON Formatter Tool

Before you buy the full template, try the **free standalone JSON Formatter**. It uses the same offline PWA technology, the same service worker architecture, and the same Vercel deployment pipeline — just with one tool instead of five.

**[Download Free →](https://tinycoderstudio.gumroad.com/l/pwa-json-formatter)**

This free tool is your proof of concept. If you like how it works, the full template gives you four more tools, a customization guide, and a step-by-step Vercel deploy walkthrough.

---

## config.js — One-File Rebrand

Every brandable setting lives in a single file: `src/config.js`. Change the app name, theme colors, Gumroad URLs, and tool definitions in one place. No hunting through manifest.json, no editing multiple HTML files, no CSS variable overrides scattered across stylesheets.

```js
// src/config.js
export const BRAND = {
  name: 'TinyCoder',
  shortName: 'TinyCoder',
  description: 'PWA Starter Template for Freelancers',
  url: 'https://toolbox-lilac-three.vercel.app',
  github: 'https://github.com/tiny-coder-2104/toolbox',
  gumroad: 'https://tinycoderstudio.gumroad.com/l/gyhehh',
  freeTool: 'https://tinycoderstudio.gumroad.com/l/pwa-json-formatter',
}

export const THEME = {
  background: '#0F172A',
  theme: '#06B6D4',
  text: '#E2E8F0',
  accent: '#06B6D4',
}
```

Edit this file, rebuild, and you have a completely different product. This is the fastest rebrand workflow in the PWA template space — one file, five minutes, new product.

---

## What's Inside

| Tool | Description |
|------|-------------|
| JSON Formatter | Pretty-print, validate, and minify JSON |
| Base64 Encoder | Encode/decode Base64 strings |
| Regex Tester | Test regular expressions with live matching |
| URL Encoder | Encode/decode URLs and query parameters |
| UUID Generator | Generate v4 UUIDs instantly |

Each tool is fully functional out of the box. Replace them with your own tools, or keep them and focus on deployment and branding. The template includes routing, offline support, and a service worker that handles caching automatically.

---

## Quick Start

```bash
# Clone
git clone https://github.com/tiny-coder-2104/toolbox.git
cd toolbox

# Install
npm install

# Run locally
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
```

That is it. Five commands and you are running a working PWA on your local machine. The dev server supports hot module replacement, and the build produces an optimized `dist/` folder ready for Vercel deployment.

---

## Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Select your repo
4. Deploy (zero config needed)
5. Done — your PWA is live with SSL, CDN, and offline support

Vercel automatically detects the Vite build, serves the PWA manifest, registers the service worker, and provisions a global CDN. No `vercel.json` required. No build commands to configure. The `package.json` scripts handle everything.

Your PWA is now available at a `*.vercel.app` subdomain with automatic HTTPS, HTTP/2, and edge caching. If you connect a custom domain, Vercel handles SSL certificate provisioning and renewal automatically.

---

## Tech Stack

- **Frontend:** Vanilla JS + Vite
- **PWA:** Service Worker + Web App Manifest
- **Hosting:** Vercel (free tier)
- **Payments:** Gumroad
- **Backend:** None — 100% client-side

No React. No Vue. No framework overhead. Just vanilla JavaScript that runs everywhere, builds fast, and deploys in seconds. Vite provides the build tooling with sub-second hot reload. The service worker caches all assets for offline use. The web app manifest makes the PWA installable on mobile and desktop.

---

## Pricing

| Tier | Price | Includes |
|------|-------|----------|
| **Basic** | $29 | Template source, built output, README, deploy guide |
| **Pro** | $49 | + AI Chatbot Prompt Kit (5 industry templates), Customization Guide |
| **Agency** | $79 | + Commercial License, White-label Guide, Sales Materials |

**[Buy on Gumroad →](https://tinycoderstudio.gumroad.com/l/gyhehh)**

### Free Tool

Grab the **PWA JSON Formatter** standalone — free, works offline, email required for download.

**[Download Free →](https://tinycoderstudio.gumroad.com/l/pwa-json-formatter)**

---

## Use Cases

- **Freelancers:** Ship small utility apps for clients without rebuilding from scratch. A freelance web dev who needs a JSON formatter for a client project should not spend a weekend building one from scratch. Use this template, customize the tools, deploy to Vercel, and hand it off in an afternoon.
- **Agencies:** Sell PWAs as a product under your own brand (Agency License). Buy the template, rebrand it using `src/config.js`, and pitch it as a custom PWA solution. You are not reselling the template — you are selling the finished product with your name on it.
- **Solo Devs:** Skip boilerplate, get a working PWA foundation with routing and offline support. If you are building a side project or SaaS prototype, start with this template instead of configuring a build pipeline from zero.

---

## Why PWA?

Progressive Web Apps are the future of client-side software. They work offline, install on any device, and feel like native apps without the app store gatekeeping. For freelance web developers, PWAs represent the fastest path from idea to deployed product.

- **Installable:** Users add your PWA to their home screen without visiting an app store
- **Offline-capable:** Service workers cache assets and data for offline use
- **Zero backend:** No server costs, no database management, no API maintenance
- **Cross-platform:** Works on desktop, mobile, and tablet from a single codebase
- **Fast:** Vite builds are optimized, Vercel serves them from edge locations worldwide

---

## SEO and Discoverability

This template is built with SEO best practices baked in. The PWA manifest, structured metadata, and semantic HTML ensure that search engines can index and rank your PWA properly.

- **Web App Manifest:** Defines name, icons, theme colors, and display mode
- **Service Worker:** Enables offline mode and background sync
- **Semantic HTML:** Proper heading hierarchy and alt text for accessibility
- **Open Graph:** Social media preview cards for Twitter and LinkedIn
- **Structured Data:** JSON-LD markup for rich search results

---

## PWA Architecture

The template uses a service worker to cache all assets and enable offline functionality. When a user first visits the PWA, the service worker installs and caches the HTML, CSS, JavaScript, and icons. On subsequent visits — even without an internet connection — the cached assets are served instantly.

The service worker (`public/sw.js`) implements a cache-first strategy for static assets and a network-first strategy for any dynamic content. This means the PWA loads instantly on repeat visits and falls back to the network when the cache is stale or unavailable.

Key architectural decisions:
- **Cache-first for assets:** HTML, CSS, JS, and icons are cached on install and served from cache
- **Network-first for API calls:** If the PWA ever needs to fetch data, it tries the network first and falls back to cache
- **Offline fallback:** A dedicated offline page is served when neither network nor cache is available
- **Background sync:** The service worker can queue actions when the user is offline and sync them when connectivity returns

The web app manifest (`public/manifest.json`) defines the PWA's identity: name, icons, theme colors, and display mode. This is what makes the PWA installable on mobile devices — users can add it to their home screen without visiting an app store.

---

## Browser Support

This template targets modern browsers that support ES6+ features, service workers, and the Push API.

- **Chrome/Edge:** Full support (service workers, PWA install prompt, all features)
- **Firefox:** Full support (service workers, PWA manifest)
- **Safari:** Partial support (service workers work, but PWA install prompt requires iOS 16.4+)
- **Mobile browsers:** Full support on Chrome for Android, Safari on iOS 16.4+

Vite's build process automatically transpiles ES6+ to compatible JavaScript based on your target browsers. The `browserslist` configuration in `package.json` controls which polyfills and transformations are applied.

---

## Build Process

The build pipeline is handled by Vite, which provides fast development server startup and optimized production builds.

```bash
# Development
npm run dev        # Starts Vite dev server with HMR

# Production build
npm run build      # Optimizes and bundles for deployment

# Preview production build
npm run preview    # Local preview of the production build
```

The `npm run build` command produces a `dist/` directory containing:
- Minified and tree-shaken JavaScript
- Optimized CSS with autoprefixing
- Resized and compressed icons
- The `index.html` with correct asset hashes
- The service worker and PWA manifest

This `dist/` folder is what Vercel deploys. The entire build process takes under 10 seconds for this template size.

---

## Customization Guide

Rebranding the template is straightforward. The `src/config.js` file centralizes all brandable settings. Here is the full customization checklist:

1. **Brand identity:** Update `BRAND.name`, `BRAND.shortName`, and `BRAND.description` in `src/config.js`
2. **Theme colors:** Change `THEME.background`, `THEME.theme`, and `THEME.text`
3. **Tool definitions:** Replace or reorder tools in the `TOOLS` array
4. **Payment links:** Update `BRAND.gumroad` and `BRAND.freeTool` URLs
5. **Icons:** Swap files in `public/icons/` (192px and 512px PNG required)
6. **Manifest:** Update `public/manifest.json` if you change the app name
7. **Deploy:** Push to GitHub, Vercel auto-deploys

The entire rebrand process takes approximately five minutes for a simple name and color change. More complex customizations — adding new tools, changing the layout, modifying the service worker strategy — may take longer but are well-documented in the template source.

---

## Vercel Deployment Deep Dive

Vercel is the recommended hosting platform for this template because it provides zero-config deployment, automatic SSL, a global CDN, and free tier hosting that covers most use cases.

When you push to GitHub, Vercel detects the Vite configuration and runs `npm run build` automatically. The output goes to the `dist/` directory, which Vercel serves as static assets. The service worker is registered from the root, and the PWA manifest is served from `/manifest.json`.

Key Vercel features for this template:
- **Automatic HTTPS:** SSL certificates are provisioned and renewed automatically
- **Edge CDN:** Assets served from 30+ global locations
- **Preview deployments:** Every PR gets a unique URL for testing
- **Branch deployments:** Main branch deploys to production, PR branches get preview URLs
- **Zero config:** No `vercel.json` needed — Vite detection handles everything

---

## FAQ

**Do I need Node.js?**
Yes, for development (Node 16+). Deployment to Vercel requires no local setup if you connect from GitHub. The build runs on Vercel's infrastructure automatically when you push to the connected repository.

**Can I use this for client work?**
Yes. The Agency License permits client use. You cannot resell the template itself, but you can build client projects on top of it and charge for the finished product. This is the standard model for template-based freelance work.

**Is there a free trial?**
No free trial — the paid template is a one-time purchase. Try the [Free JSON Formatter](https://tinycoderstudio.gumroad.com/l/pwa-json-formatter) instead: same offline tech, email required for the free download. The free tool demonstrates the full PWA architecture and offline capability.

**What support is included?**
- Basic: Email support (48hr response, best-effort)
- Pro: Priority email support (24hr response, best-effort)
- Agency: Priority email support (24hr response, best-effort) + white-label guidance

**Refund policy?**
30-day money-back guarantee. No questions asked. If the template does not work for your use case, contact us through Gumroad and you will receive a full refund within 30 days of purchase.

**How do I add my own tools?**
Edit the `TOOLS` array in `src/config.js` to add, remove, or reorder tools. Each tool entry defines the title, description, and icon. The main view renders dynamically from this array. For custom tool logic, add new functions in `src/main.js` following the existing pattern.

**Can I use a custom domain?**
Yes. Vercel supports custom domains with automatic SSL. Add your domain in the Vercel dashboard, update the `BRAND.url` in `src/config.js`, and Vercel handles the rest.

**Is the service worker configurable?**
Yes. The service worker is in `public/sw.js`. You can customize the caching strategy, add background sync, or implement push notifications. The default strategy is cache-first for assets and network-first for API calls.

---

## License

- **Basic/Pro:** Your own projects only (including your own commercial products built on the template).
- **Agency:** Everything in Pro, plus client work and selling finished products under your own brand. You may not resell or redistribute the template itself.

See [LICENSE](LICENSE) for details.

---

## GitHub Sponsors

This project is open-source and funded by its users. [GitHub Sponsors](https://github.com/sponsors/tiny-coder-2104) provides a way to support ongoing development with zero platform fees — 100% of your contribution goes directly to the developer.

Sponsoring helps fund:
- New tools and features
- Template updates and bug fixes
- Documentation and deployment guides
- Community support and response time

Even a $1 monthly sponsorship makes a difference. You can also sponsor one-time contributions for specific features or bug fixes.

**[Sponsor on GitHub →](https://github.com/sponsors/tiny-coder-2104)**

---

## Contact

- GitHub: [tiny-coder-2104](https://github.com/tiny-coder-2104) (issues and questions)
- Paid buyers: reply via your Gumroad purchase receipt email for support
- Free tool users: check the Gumroad download page for updates

---

## Keywords

pwa, template, offline, installable, freelance, vercel, javascript, vite, service worker, web app manifest, white-label, client-side, static site, developer tools, json formatter, base64, regex, url encoder, uuid, freelance web dev, pwa starter, deploy to vercel, zero backend, offline capable, installable web app

---

*Built by [TinyCoder Studio](https://tinycoderstudio.gumroad.com). Ship fast. Ship offline. Sponsor on [GitHub Sponsors](https://github.com/sponsors/tiny-coder-2104).*
