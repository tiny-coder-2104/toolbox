# Current Context

## What We're Doing Now
Building the TinyCoder Web Toolbox PWA. Memory system is complete. Vite project scaffolded and production build verified. Moving to deployment and tool implementation.

## Immediate Next Steps (in execution order)
1. ✅ Memory system designed and all files created
2. ✅ Node.js 16 installed via nvm
3. ✅ Vite project scaffolded (vanilla JS)
4. ✅ Production build successful
5. ✅ PWA manifest + service worker working
6. 🔜 Initialize git repo → push to GitHub → connect Netlify
7. 🔜 Build individual tool pages (JSON, Base64, Regex, URL, UUID)
8. 🔜 Test PWA installability on mobile
9. 🔜 List on Gumroad
10. 🔜 Launch and promote

## What to Remember
- User is broke — zero budget
- User is a Swiss knife dev — works fast with broad skills
- Target: first sell within 5-7 days
- All tools must be client-side
- No backend, no complex infrastructure
- Ubuntu 18.04 machine with GLIBC 2.27 — must use Node.js 16 (via nvm)
- vite-plugin-pwa incompatible with Node 16 ESM — manual PWA setup used instead
- Manual PWA: manifest.json + sw.js in public/ directory

## Architecture Decisions
- Vite 4.5.14 (not 5+) for Node 16 compatibility
- Manual service worker (public/sw.js) instead of Workbox
- Manual manifest (public/manifest.json) instead of vite-plugin-pwa manifest generation
- Vanilla JS — no framework overhead
- Netlify for free hosting with auto-HTTPS
- Gumroad/LemonSqueezy for payments

## Session Notes
- Session 1: Memory system created (13 files), project config wired
- Session 2: Build phase — Vite scaffolded, build verified, PWA working
- Next: Git + GitHub + Netlify deployment