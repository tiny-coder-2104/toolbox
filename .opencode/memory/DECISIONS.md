# Key Decisions

## PWA over Godot Android
- **Why**: PWA is 50-70% cheaper than native dual-platform, no app store dependency, faster time to market
- **Why not Godot**: Requires JDK + Android SDK + NDK + Gradle on Ubuntu 18.04 — heavy toolchain, compatibility risks
- **Why not both**: Cannot afford both time and money for two paths

## Developer Utilities over PDF Tools
- **Why**: Plays directly to user's infra/security skills — domain knowledge already exists
- **Why not PDF toolkit**: Broader consumer market but less differentiated by user's background
- **Developer audience**: Pays for clean, ad-free tools; less price-sensitive than consumers

## Vanilla JS over Framework
- **Why**: Fastest build time, no framework overhead, sufficient for utility tools
- **Why not React/Vue**: Build tooling adds complexity, not needed for simple tools
- **Vite + vanilla**: Quick setup, minimal config, easy to extend

## Netlify + Gumroad ($0 Cost) → REVISED: Vercel
- **Why Vercel (revised, Session 3)**: User already had a Vercel account; free tier, auto-HTTPS, Git auto-deploy on push. Live at toolbox-lilac-three.vercel.app. Netlify dropped — no need to create a new account when Vercel was available.
- **Why Gumroad**: Free product listing, handles payments/delivery, no upfront cost
- **Why zero backend**: Eliminates server costs, security concerns, deployment complexity

## Two-Track Strategy (added Session 3) — FREELANCE FIRST
- **Track B (priority)**: Toolbox = live portfolio to land paid freelance PWA/web dev work. Target income in 1-2 weeks. Reps first, polish later.
- **Track A (long game)**: Toolbox stays free-first to drive traffic; monetize the tail later (Pro tier / pay-what-you-want / donate).
- **Why revised**: Original paid-only plan ($3-5 one-time) fights zero distribution + commodity product + free alternatives. Marketing can't create a flywheel at zero audience.

## 5 Tools at Launch (not 1)
- **Why**: Each tool is small; shipping all 5 together doesn't add much time vs 1-2
- **Why not 1 tool first**: Developer utility buyers expect a toolkit, not a single tool
- **MVP scope**: All 5 tools can be built in 2-3 days

## One-Time Payment ($3-5) over Subscription
- **Why**: Faster to sell — lower commitment for first-time buyers
- **Why not subscription**: Harder to sell first product; can add subscription later after validation
- **Upsell path**: One-time → subscription → API access → custom tools