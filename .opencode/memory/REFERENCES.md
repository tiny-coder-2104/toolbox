# References & Resources

## PWA Research
- PWA market exceeded $15 billion in 2025 (NashTech industry report)
- Major PWA adopters: Twitter/X, Pinterest, Starbucks, Uber, Spotify, Telegram
- iOS Safari fully supports PWAs as of 2026 (service workers, push, installability)
- PWAs cost 50-70% less than native apps; time to market roughly half

## Tools & Platforms
- **Netlify** — free hosting, auto-HTTPS, Git-based deploys
- **Gumroad** — digital product marketplace, free listing, handles payments
- **LemonSqueezy** — alternative to Gumroad for digital products
- **Vite** — frontend build tool, fast HMR, minimal config
- **vite-plugin-pwa** — PWA plugin for Vite using Workbox
- **Workbox** — Google's library for service worker caching strategies
- **Bubblewrap / PWABuilder** — wrap PWA as TWA for Google Play
- **Capacitor** — wrap PWA in native shell for App Store

## OpenCode System
- **opencode.jsonc** — global config at `~/.config/opencode/opencode.jsonc`
- **opencode binary** — `/home/yuki/.opencode/bin/opencode`
- **Project config** — `opencode.json` in project root (highest precedence)
- **`.opencode/`** — project directory for agents, commands, plugins
- **`instructions` field** — array of file paths injected into system prompt
- **`AGENTS.md`** — auto-loaded from project root for project rules

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