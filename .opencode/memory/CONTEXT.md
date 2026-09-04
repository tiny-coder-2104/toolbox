# Current Context

## What We're Doing Now
- TinyCoder Web Toolbox PWA live at toolbox-lilac-three.vercel.app
- AI Automation Portfolio live at ai-automation-portfolio-green.vercel.app
- **Fiverr gig LIVE**: "I will build an AI chatbot for your website or WhatsApp"
  - Username: jercon
  - Packages: $50 / $150 / $300
  - **Promo video uploaded** (created in Canva, free, no watermark)
  - **Gallery images**: DavaoBook + AI Portfolio screenshots
  - First platform for landing freelance work
- **Gumroad product LIVE**: "TinyCoder Web Toolbox — 5 Essential Dev Tools Template"
  - URL: https://tinycoderstudio.gumroad.com/l/gyhehh
  - Price: ₱1,187.88 (~$19)
  - Digital download: complete PWA source code
  - Track A (passive income) now active alongside Track B (freelance)

## Immediate Next Steps (in execution order)
1. ✅ Memory system designed and all files created
2. ✅ Node.js 16 installed via nvm
3. ✅ Vite project scaffolded (vanilla JS)
4. ✅ Production build successful
5. ✅ PWA manifest + service worker working
6. ✅ Git repo pushed to GitHub (tiny-coder-2104/toolbox) via deploy key
7. ✅ All 5 tool pages built (JSON, Base64, Regex, URL, UUID)
8. ✅ Deployed live on Vercel (toolbox-lilac-three.vercel.app), auto-deploy on push
9. ✅ Fiverr gig created and live
10. ✅ Gumroad product created and live
11. 🔜 Wait for first orders on Fiverr
12. 🔜 Drive traffic to Gumroad (dev.to post, Twitter, Reddit, GitHub repo)
13. 🔜 Create second Fiverr gig: "I will build a workflow automation for your business"
14. 🔜 Apply to OnlineJobs.ph jobs (AI Chatbot Developer, AI Automation roles)
15. 🔜 Test PWA installability on mobile
16. 🔜 Launch and promote

## Gumroad Product Strategy (2026-09-03 analysis)
- See GUMROAD_ANALYSIS.md for full market data and recommendation
- **Reposition current product** from "5 Dev Tools" to "PWA Starter Template for Client Projects"
- Target: freelance web devs who need a client-ready PWA starter
- Price: **$29 / $49 / $79** tiered (was $19)
- Bundle: PWA template + AI chatbot prompt kit (5 industry templates) + deployment guide
- Rationale: commodity tools compete with free alternatives; repositioned product targets freelancers who pay for time savings
- SaaS Starter Kit still planned but NOT until repositioned product validates
- **Note:** user has separate task (`/home/yuki/ai_works/pseudo_human/memory_upgrade`) to upgrade OpenCode agent memory system — unrelated to project memory in `.opencode/memory/`

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
- **AgentMail inbox:** `tiny-coder-2104@agentmail.to` — verified working via IMAP (imap.agentmail.to:993, inbox=9, sent=4, spam=3). Creds (github pw + `am_` API key) stored in `~/Documents/new_creds.txt`. IMAP password = the `am_` API key, not the github password.
- **Supabase:** org `tinycoders-studio`, project `gchcatdprvpmbwvfxqzi` (Free, ap-northeast-2), live. Publishable key works for RLS-gated REST reads; there's a `public.blocks` table. All creds in `~/Documents/new_creds.txt` (publishable/legacy keys + PAT `sbp_...`). DB password unknown (reset in dashboard if needed) → `supabase link` CLI will need it.
- **Chrome automation available**: CDP tools in `tools/browser/` (python3.6 stdlib, no deps) — can drive the user's Chrome on `:10.0` via copied profile + debug port 9222. See TOOLS.md.

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
