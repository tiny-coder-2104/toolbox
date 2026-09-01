# Tool Conventions

## Development Environment
- **Editor**: Sublime Text (already installed)
- **Terminal**: bash
- **OS**: Ubuntu 18.04 LTS (Bodhi Linux)

## Package Management
- **System**: apt (for Node.js, git, and system deps)
- **Project**: npm / npx (via Node.js)

## Development Tools
- **Vite** — project scaffolding and dev server
- **Manual service worker** — public/sw.js (NOT Workbox; vite-plugin-pwa incompatible with Node 16)
- **Lighthouse** — PWA audit and performance testing
- **Git** — version control
- **GitHub** — remote repo (tiny-coder-2104/toolbox) + Vercel integration

## Deployment
- **Vercel** — free tier, Git-connected, auto-deploy on push (live: toolbox-lilac-three.vercel.app)
- **Vercel CLI** — for manual `vercel` / `vercel --prod` deploys
- **Deploy key** — ed25519 at ~/.ssh/tinycoder_deploy_key (used for git push to GitHub)

## Payments
- **Gumroad** — product listing, checkout, delivery
- **Gumroad CLI/API** — programmatic product management

## Testing
- **Browser testing**: Midori (installed), Chrome (install if needed)
- **Lighthouse PWA audit**: built into Chrome DevTools or CLI
- **Real device testing**: Android phone for PWA install test

## Workflow Rules
- No backend code — client-side only
- All tools use pure JavaScript, no WASM unless necessary
- Service worker handles caching and offline support
- HTTPS enforced at all times (via Vercel)
- Commit frequently to git
- Push to GitHub → Vercel auto-deploys
- **Ponytail is ACTIVE globally** (opencode plugin) — lazy-senior-dev ruleset governs coding: YAGNI, reuse stdlib/codebase before new code, native features over deps, shortest working diff. Change level via `/ponytail [lite|full|ultra|off]`. Persists across sessions.

## Node.js Installation (Ubuntu 18.04)
- Use NodeSource or nvm for Node.js 18+
- `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -`
- `sudo apt install -y nodejs`