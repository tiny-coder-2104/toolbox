# TinyCoder

## Project
Web Toolbox PWA — browser-based developer utilities. Zero backend. Client-side only.

## Memory System
Read `.opencode/memory/INDEX.md` first. Drill into individual files lazily — only load what's relevant to the task.

## Subagents
- **@dev-worker** — delegates all coding, repackaging, and deployment tasks here
- **@loki** — marketing, strategy, deal psychology
- **@product-reviewer** — pre-ship audits, compliance checks, claim verification (read-only, returns verdict)

## Stack
Vanilla JS + Vite. Vercel hosting. Gumroad payments. No backend.

## Phase
Plan → Build MVP → Deploy → Freelance/Sell.

## Rules
- Client-side only, no backend code
- Use vanilla JS unless a framework is explicitly needed
- All memory files in `.opencode/memory/`
- Update LOG.md after each significant session change

## Browser/Toolkit (tools/)

**Location:** `/home/yuki/ai_works/tiny_coder/tools/`
**Node:** 16 ONLY — `/home/yuki/.nvm/versions/node/v16.20.2/bin/node` (node20 broken on glibc)
**Module system:** CommonJS, plain `argv` parsing, no frameworks
**State files:**
- `post-schedule.json` — tracks `last_post` (ISO) and `platforms_posted[]` per platform
- `post-log.json` — log of all posts across platforms (content, timestamp, subreddit/platform, URL)

### Rules (apply to ALL tools below)
- **Dry-run default** — every mutating tool does nothing unless `--yes` is passed
- **KILL_SWITCH** env guardrail — tools check `AGENT_STATE.md` at `~/ai_works/tiny_coder/AGENT_STATE.md`; if armed-stop, tools refuse to run
- **48-hour spacing** — `check-post-readiness.js` enforces minimum 48h between posts
- **No auto-posting/deploying** — ever. All destructive or public-facing actions require human approval

### Tools

| Tool | Purpose | Invoke | Example |
|------|---------|--------|---------|
| `cdp.js` | Shared CDP library — `listTargets`, `evalInTab`, `clickByText`, `fillInput`, `setFileInput`, `screenshot`, `pageText` | Library only, `require('./cdp')` | `node -e "const c=require('./cdp'); c.listTargets().then(console.log)"` |
| `verify-links.js` | Link checker — HEAD requests, up to 3 redirects | `node tools/verify-links.js <url...>` | `node tools/verify-links.js https://toolbox-lilac-three.vercel.app` |
| `gumroad-upload.js` | Upload file to Gumroad product edit tab | `node tools/gumroad-upload.js --file <path> [--yes]` | `node tools/gumroad-upload.js --file ./dist/bundle.zip --yes` |
| `vercel-status.js` | Check Vercel deployment status — exit 0 if READY | `node tools/vercel-status.js [--tab <substr>]` | `node tools/vercel-status.js && echo READY \|\| echo NOT_READY` |
| `chatbase-kb.js` | Update Chatbase knowledge base snippet + retrain | `node tools/chatbase-kb.js --snippet <name> --file <path> [--yes]` | `node tools/chatbase-kb.js --snippet "e-commerce" --file ./prompts/ecommerce.txt --yes` |
| `check-post-readiness.js` | Enforce 48h post spacing + track state | `node tools/check-post-readiness.js --platform <name> [--yes]` | `node tools/check-post-readiness.js --platform twitter --yes` |
| `sales-check.js` | Read Gumroad CSV sales data (read-only) | `node tools/sales-check.js [--n <count>]` | `node tools/sales-check.js --n 5` |
| `slack.js` | Slack API — whoami, channels, send, history | `node tools/slack.js --action <action> [--channel <id>] [--text "msg"]` | `node tools/slack.js --action send --channel C01H717EL1M --text "hello"` |
| `twitter-poster.js` | Post to Twitter/X via Chrome CDP (no API needed) | `node tools/twitter-poster.js --text "msg" [--yes]` | `node tools/twitter-poster.js --text "Just shipped!" --yes` |
| `reddit-poster.js` | Post to Reddit via Chrome CDP (no API needed) | `node tools/reddit-poster.js --sub <name> --title "t" --body "b" [--yes]` | `node tools/reddit-poster.js --sub SideProject --title "Launch" --body "..." --yes` |
| `content-templates.js` | Template system — load, render, list, generate from context | `node tools/content-templates.js --action <action> [--template <name>]` | `node tools/content-templates.js --action list` |

### Prerequisites
- Chrome running with `--remote-debugging-port=9222` and logged-in session (for CDP tools)
- `ws` package vendored at `tools/node_modules/ws` (v8.21.3)