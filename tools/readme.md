# TinyCoder Tools — CDP/DevOps Toolkit

## `tools/cdp.js` — Shared CDP Primal
**Usage:** `node -e "const c=require('./cdp'); c.listTargets().then(console.log)"`
**Flags:** None (library). Set `CDP_PORT` env var for non-default port.
**Example:** `CDP_PORT=9222 node -e "const c=require('./cdp'); c.listTargets().then(t=>t.forEach(x=>console.log(x.title)))"`
**Guardrail:** Library only — no mutating actions. All other tools require `--yes` for writes. KILL_SWITCH at `~/ai_works/tiny_coder/AGENT_STATE.md` must not be armed-stop.

## `tools/verify-links.js` — Link Checker
**Usage:** `node tools/verify-links.js <url1> <url2> ...` or pipe via stdin.
**Flags:** `--check N` exit on N failures.
**Example:** `node tools/verify-links.js https://toolbox-lilac-three.vercel.app`
**Guardrail:** Read-only. Follows up to 3 redirects. No `--yes` needed.

## `tools/gumroad-upload.js` — Gumroad File Upload
**Usage:** `node tools/gumroad-upload.js --file <path> [--tab <substring>] [--yes]`
**Flags:** `--file` path (required); `--tab` substring (default `products/gyhehh/edit`); `--yes` execute.
**Example:** `node tools/gumroad-upload.js --file ./dist/bundle.zip --yes`
**Guardrail:** Default dry-run. `--yes` required to set file input. Assumes Chrome --remote-debugging-port=9222 with logged-in session.

## `tools/vercel-status.js` — Deployment Status
**Usage:** `node tools/vercel-status.js [--tab <substring>]`
**Flags:** `--tab` URL/title substring (default `vercel`).
**Example:** `node tools/vercel-status.js && echo READY || echo NOT_READY`
**Guardrail:** Read-only. Exit 0 if latest READY, else 1. No `--yes` needed.

## `tools/chatbase-kb.js` — Knowledge Base Update
**Usage:** `node tools/chatbase-kb.js --snippet <name> --file <path> [--tab <substring>] [--yes]`
**Flags:** `--snippet` name; `--file` path; `--tab` substring (default `chatbase`); `--yes` execute.
**Example:** `node tools/chatbase-kb.js --snippet "e-commerce" --file ./prompts/ecommerce.txt --yes`
**Guardrail:** Default dry-run. `--yes` required to set content, Save, and Retrain. No auto-post.

## `tools/package.json` — Dependencies
**Usage:** `node tools/<tool>.js --help` — each tool runs without crashing.
**Flags:** None. `ws` pinned at 8.21.3. Node 16 only. CommonJS.
**Example:** `node tools/verify-links.js --help`
**Guardrail:** No new deps beyond `ws` + builtins. `npx` not needed.
