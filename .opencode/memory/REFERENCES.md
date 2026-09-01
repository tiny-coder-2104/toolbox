# References & Resources

## PWA Research
- PWA market exceeded $15 billion in 2025 (NashTech industry report)
- Major PWA adopters: Twitter/X, Pinterest, Starbucks, Uber, Spotify, Telegram
- iOS Safari fully supports PWAs as of 2026 (service workers, push, installability)
- PWAs cost 50-70% less than native apps; time to market roughly half

## Tools & Platforms
- **Vercel** — free hosting, auto-HTTPS, Git auto-deploy (live: toolbox-lilac-three.vercel.app)
- **Gumroad** — digital product marketplace, free listing, handles payments
- **LemonSqueezy** — alternative to Gumroad for digital products
- **Vite** — frontend build tool, fast HMR, minimal config
- **vite-plugin-pwa** — PWA plugin for Vite using Workbox (NOT used — Node 16 incompat)
- **Workbox** — Google's library for service worker caching strategies (NOT used — manual SW instead)
- **Bubblewrap / PWABuilder** — wrap PWA as TWA for Google Play
- **Capacitor** — wrap PWA in native shell for App Store

## Freelance Platforms (Track B)
- **OnlineJobs.ph** — PH-based job board, high Filipino dev success rate (target job: ID 1675298 "7 apps bundled into one", $15-25/hr, paid trial)
- **OLJ / Upwork / Fiverr** — additional freelance channels
- **/r/forhire, /r/freelance_forhire** — Reddit freelance job posts

## OpenCode System
- **opencode.jsonc** — global config at `~/.config/opencode/opencode.jsonc`
- **opencode binary** — `/home/yuki/.opencode/bin/opencode`
- **Project config** — `opencode.json` in project root (highest precedence)
- **`.opencode/`** — project directory for agents, commands, plugins
- **`instructions` field** — array of file paths injected into system prompt
- **`AGENTS.md`** — auto-loaded from project root for project rules
- **Ponytail plugin** — `@dietrichgebert/ponytail` installed GLOBAL (opencode.jsonc `plugin` array). Injects "lazy senior dev" ruleset (YAGNI/stdlib/native-first). Commands: `/ponytail [lite|full|ultra|off]`, `/ponytail-review`, `/ponytail-audit`, `/ponytail-debt`, `/ponytail-gain`, `/ponytail-help`. Resolved to `~/.cache/opencode/packages/@dietrichgebert/ponytail@latest`. Works in-process (no separate node binary needed — safe on GLIBC 2.27). Requires opencode restart to load.

## Memory Plugins (Future Enhancement)
- `@csuwl/opencode-memory-plugin` — OpenClaw-style memory with semantic search
- `opencode-localmemory` — local Markdown memory files
- `@navopw/opencode-memory` — semantic memory with embeddings

## Pricing Reference
- Simple PWA conversion: $2,500-$6,000
- Full PWA from scratch (small): $8,000-$20,000
- SaaS-grade PWA: $25,000-$60,000
- Equivalent native iOS + Android: $60,000-$180,000
- Our PWA budget: $0 (free tools + free hosting)