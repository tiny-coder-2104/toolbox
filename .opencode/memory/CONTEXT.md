# Current Context

## What We're Doing Now
TinyCoder Web Toolbox PWA is **live** at `https://toolbox-lilac-three.vercel.app`. All 5 tools functional. Deployed on Vercel (connected to GitHub auto-deploy). Next focus: freelancing (Track B) for fast revenue, using the toolbox as portfolio proof.

## Immediate Next Steps (in execution order)
1. ✅ Memory system designed and all files created
2. ✅ Node.js 16 installed via nvm
3. ✅ Vite project scaffolded (vanilla JS)
4. ✅ Production build successful
5. ✅ PWA manifest + service worker working
6. ✅ Git repo pushed to GitHub (tiny-coder-2104/toolbox) via deploy key
7. ✅ All 5 tool pages built (JSON, Base64, Regex, URL, UUID)
8. ✅ Deployed live on Vercel (toolbox-lilac-three.vercel.app), auto-deploy on push
9. 🔜 **Register free jobseeker on OnlineJobs.ph** → apply to PWA jobs (target: job 1675298, "7 apps bundled into one")
10. 🔜 Draft & submit tailored application (needs live URL = toolbox — now have it)
11. 🔜 Test PWA installability on mobile
12. 🔜 List on Gumroad (Pro tier / pay-what-you-want)
13. 🔜 Launch and promote

## Strategy (decided this session — IMPORTANT)
- **Track B first** (user's priority: fast revenue): use toolbox as live portfolio to land freelance PWA/dev work via OnlineJobs.ph, OLJ, Upwork.
- **Track A (long game):** toolbox stays free-first, monetize the tail later via Pro tier / pay-what-you-want / donations.
- Users are broke — time is the only resource. Don't over-polish the commodity toolbox; prioritize landing paid work.

## What to Remember
- User is broke — zero budget. From the Philippines.
- User is a Swiss knife dev — works fast with broad skills
- Target: first income within 5-7 days (via freelance, Track B)
- All tools must be client-side
- No backend, no complex infrastructure
- Ubuntu 18.04 machine with GLIBC 2.27 — must use Node.js 16 (via nvm)
- vite-plugin-pwa incompatible with Node 16 ESM — manual PWA setup used instead
- Manual PWA: manifest.json + sw.js in public/ directory
- **Deploy platform is Vercel (NOT Netlify)** — user had a Vercel account
- **GitHub repo:** tiny-coder-2104/toolbox; deploy key at ~/.ssh/tinycoder_deploy_key; SSH config set up
- **Live URL (portfolio proof):** https://toolbox-lilac-three.vercel.app
- Node build needs `nvm use 16` first (system node fails on GLIBC)

## Architecture Decisions
- Vite 4.5.14 (not 5+) for Node 16 compatibility
- Manual service worker (public/sw.js) instead of Workbox
- Manual manifest (public/manifest.json) instead of vite-plugin-pwa manifest generation
- Vanilla JS — no framework overhead
- Hash-based client-side router (main.js) — tool pages at /#/json etc.
- **Vercel** hosting with git auto-deploy (free, auto-HTTPS)
- Gumroad/LemonSqueezy for payments (future)

## Session Notes
- Session 1: Memory system created (13 files), project config wired
- Session 2: Build phase — Vite scaffolded, build verified, PWA working
- Session 3: Deploy key generated, pushed to GitHub, all 5 tools built, deployed live on Vercel, Base64 Unicode bug fixed
- Next: register on OnlineJobs.ph → apply to PWA jobs for first freelance income
