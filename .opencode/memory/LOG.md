# Session Log

## Session 1 — 2026-09-01
**Action**: Memory system and project config created
- Chose PWA over Godot Android for Android game dev
- Chose developer utility suite over PDF toolkit
- Designed `.opencode/memory/` structure with 11 memory files + AGENTS.md + opencode.json
- Created `opencode.json` with `instructions` pointing to AGENTS.md + INDEX.md
- Created `AGENTS.md` with project rules
- Pre-populated all memory files with project context
- ✅ Memory system setup complete

## Session 2 — 2026-09-01
**Action**: Build phase — Vite project initialized and production build successful
- Installed Node.js 16.20.2 via nvm (Ubuntu 18.04 GLIBC 2.27 constraint)
- Created project: index.html, src/main.js, src/style.css, vite.config.js
- Created public/manifest.json, public/sw.js, public/favicon.png, public/icons/
- Attempted vite-plugin-pwa — incompatible with Node 16 ESM dynamic require
- Replaced with manual PWA setup (manifest.json + sw.js in public/)
- ✅ Production build successful (`npx vite build`)
- ✅ dist/ contains: index.html, manifest.json, sw.js, favicon.png, icons/, assets/
- Added .gitignore

## Session 3 — 2026-09-01
**Action**: Git/GitHub setup + built all 5 functional tool views
- Generated ed25519 deploy key for tiny-coder-2104/toolbox repo
- Wired SSH config (`~/.ssh/tinycoder_deploy_key`), verified GitHub auth
- Set git remote origin to git@github.com:tiny-coder-2104/toolbox.git
- Set git identity to tiny-coder-2104
- Built hash-router + 5 tool views in src/main.js: JSON format/minify/validate, Base64 encode/decode, Regex tester (live highlights + count), URL encode/decode (+component), UUID v1/v4 generator
- Styled tool views in src/style.css (toolbar, textarea, output, copy buttons)
- ✅ Production build successful (nvm Node 16.20.2, vite 4.5.14)
- ✅ Pushed to GitHub (branch master)
- 🔜 Next: connect Netlify for auto-deploy → live URL for portfolio

## Completed Milestones
- ✅ Memory system designed and all 13 files created
- ✅ Project scaffolded (Vite + vanilla JS)
- ✅ Production build verified
- ✅ PWA manifest + service worker working
- ✅ Git repo initialized + pushed to GitHub (tiny-coder-2104/toolbox)
- ✅ All 5 tool views functional (JSON, Base64, Regex, URL, UUID)

## To-Do (Remaining)
- Connect Netlify for auto-deploy (get live URL)
- Test PWA installability on mobile
- Register on OnlineJobs.ph jobseeker + apply to PWA jobs (e.g. job 1675298)
- List on Gumroad
- Launch and promote