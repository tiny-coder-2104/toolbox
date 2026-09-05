# Gumroad Autofill Tool

Auto-populate Gumroad product fields for **TinyCoder PWA Starter Template** (`tinycoderstudio.gumroad.com/l/gyhehh`).

## Files

| File | Purpose |
|------|---------|
| `gumroad-autofill.user.js` | Tampermonkey userscript with floating panel |
| `bookmarklet.js` | Single-line bookmarklet fallback |
| `suggestions.json` | Structured field values extracted from source files |
| `SELECTORS.md` | Documented selectors and field mappings |
| `FIELD_COVERAGE.md` | Coverage table of Gumroad fields |
| `visual_inspect.py` | CDP-based visual inspector (DOM readback + optional OCR) |
| `fill_gumroad.py` | CDP-based Gumroad product fill script |
| `last_push.json` | Log of last CDP push (before/after/save status) |

## Installation

### Tampermonkey Userscript (recommended)

1. Install [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Open Tampermonkey dashboard → **Create new script**
3. Paste the contents of `gumroad-autofill.user.js`
4. Save (Ctrl+S)
5. Navigate to `https://gumroad.com/products/gyhehh/edit`
6. The floating panel appears in the top-right corner

### Bookmarklet (fallback)

1. Copy the entire contents of `bookmarklet.js`
2. Create a new bookmark in your browser
3. Edit the bookmark, paste the entire string into the URL field
4. Save the bookmark
5. Go to the Gumroad edit page, click the bookmark
6. Enter variant number when prompted

## Usage

1. **Open the Gumroad product edit page** for your product
2. **Select a variant** from the dropdown (Basic $29 / Pro $49 / Agency License $79)
3. **Check/uncheck fields** you want to fill (fields with values are checked by default)
4. **Click "Dry Run"** first to see what would be filled without modifying the page
5. **Click "Fill All"** to actually populate the fields
6. **Review the status log** at the bottom of the panel

## What Gets Auto-Filled

| Field | Status | Notes |
|-------|--------|-------|
| Product Name | ✅ Auto | "Ship Client PWAs in an Afternoon" |
| URL Slug | ✅ Auto | "gyhehh" |
| Call to Action | ✅ Auto | "I want this!" |
| Summary | ✅ Auto | From gumroad-field-values.md |
| Description | ✅ Auto | Full HTML from gumroad-listing-pwa-starter.md |
| Amount | ✅ Auto | Matches selected variant price |
| Version Name | ✅ Auto | Matches variant name |
| Version Description | ✅ Auto | Variant-specific description |
| Version Additional Amount | ✅ Auto | Matches variant price |
| Cover Image | ⚠️ MANUAL | Must upload manually |
| Tags | ⚠️ NEEDS_LOKI | Not found in current DOM |

## Dry Run

Always use **Dry Run** first. It logs what would be set without actually modifying the page. This lets you verify selectors match before committing changes.

## Fields Injected (Lokі 2026-09-05 + N1/N2 fixes)

- **Tags** → `pwa, pwa template, vanilla js, freelancer, white label, vite, starter template, offline, client work, developer tools` (fallback selector `input[placeholder*="tag"]`)
- **Category** → `Software Development`
- **Fine Print** → 30-day refund + license (`Basic & Pro: personal use only. Agency: commercial`) — **N1 fixed**: trigger changed to "README steps (after Node 16 installed) don't get you to a working local build in 5 minutes — deploy time excluded"
- **ROI patch** → "Next client starts with the same foundation — your margin grows." (**N2 softened**)
- **Cover Image** — MANUAL: upload 1280×720 navy `#0F172A`/cyan `#06B6D4` per `cover_brief` in `suggestions.json`
- **Purchase note** → thank-you after purchase (5-min steps + reply prompt)

## CDP Fill (headless)

```bash
# Fill all Gumroad fields via CDP
python3 tools/gumroad-autofill/fill_gumroad.py

# Visual inspection (DOM readback)
python3 tools/gumroad-autofill/visual_inspect.py --port 9222 --expected tools/gumroad-autofill/suggestions.json

# Dry run without CDP
python3 tools/gumroad-autofill/visual_inspect.py --dry
```

## Limitations

- The tool cannot upload cover images (file inputs require manual interaction)
- React state may not fully update after programmatic value changes — verify in the editor
- If Gumroad updates their UI, selectors may need adjustment (check `SELECTORS.md`)
- The bookmarklet is ~7KB and may be truncated in some browsers
- **Known**: Gumroad is a React SPA — some fields revert on page re-render. Re-set after navigation. Product name and CTA persist after save.

## Technical Notes

- **No dependencies** — Pure vanilla JS, no frameworks, no npm packages
- **Label-based selectors** — Gumroad uses React-generated IDs (`:r4t:`, `:r50:`, etc.) that change on every page load. The tool finds elements by their associated label text instead.
- **Tiptap editor** — The description field uses a Tiptap/ProseMirror contenteditable div. The tool sets `innerHTML` and dispatches `input`/`blur` events.
- **CDP verified** — All selectors were inspected via Chrome DevTools Protocol on port 9222.

## Limitations

- The tool cannot upload cover images (file inputs require manual interaction)
- React state may not fully update after programmatic value changes — verify in the editor
- If Gumroad updates their UI, selectors may need adjustment (check `SELECTORS.md`)
- The bookmarklet is ~7KB and may be truncated in some browsers

## Verification

To verify selectors match without modifying the live product:

```bash
# Use CDP to test selectors
python3 /home/yuki/ai_works/tiny_coder/tools/browser/run.py eval "
  document.querySelector('label[for=\":r4t:-name\"]') ? 'found' : 'not found'
"
```

Or use the **Dry Run** mode in the panel.
