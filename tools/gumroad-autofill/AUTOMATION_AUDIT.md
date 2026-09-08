# Automation Audit — Gumroad Product Edit (2026-09-05)

**Question:** Which remaining manual steps can be automated?

**Method:** CDP on `https://gumroad.com/products/gyhehh/edit` + `…/edit/share` via `tools/browser/cdp.py:99`, `DOM.getDocument`, `DOM.querySelector`, `DOM.setFileInputFiles`, `Input.dispatchKeyEvent`, `__reactFiber` traversal.

## 1. Product Fields (Name, Summary, Description, Amount, Variants, Fine print, Refund)
- **Status: FULLY AUTOMATED** — 100% via `tools/gumroad-autofill/fill_gumroad.py:1`
- **How:** Label-based `findByLabel` (`SELECTORS.md:1`) survives React dynamic IDs `:rXX:`. `setValue` via native setter + `input/change/blur` + `setTiptap` (`div.tiptap[contenteditable]`) + `price diff` logic (`Additional amount` = `price_cents - 2900` → 0/20/50). Verified `props.product.price_cents 1900→2900`, `summary`, `variants`, `refund 30`, `fine_print_enabled:true`, `description 6546` chars.
- **Save:** `Save and continue` click via `Array.from(buttons).find(/Save and continue/)` → `is_published:true` after save.
- **Ponytail:** Keep as-is. No new deps.

## 2. Cover Image (1280×720)
- **Current: MANUAL** — `MANUAL_STEPS.md:1` (1 click)
- **Can be automated?** YES, with 20 extra lines, but fragile.
  - **CDP `DOM.setFileInputFiles` works** when file path is in `/home/yuki/...` (not `/tmp` due to Chrome sandbox `--user-data-dir=/tmp/chrome-rdp`). Test `cover-1280x720.png` at `/home/.../cover-1280x720.png` → `files.length 1` and `blob:https://gumroad.com/...` preview appears (`/tmp/gumroad_cover_...` screenshot). Using `/tmp/...` gives `files.length 0`.
  - **What's missing:** After `setFileInputFiles`, need to wait for S3 upload (blob → `https://public-files.gumroad.com/...`) and then `Save`. Our test `b5c55e7f...` blob appeared but `props.product.covers` still old after immediate `Save` (needs 5s wait + correct input among 3 `input[type=file]` — we hit preview input, not cover input; need to select input whose `accept` includes `.jpeg` and whose parent heading is `Cover`).
  - **API alternative:** `POST /products/gyhehh/covers` with `FormData` + `authenticity_token` — not found via `Edit-DySWYJUu.js` grep, would need Network capture of manual upload. Could reverse-engineer, but 1 manual upload vs 50 lines + S3 wait is not worth until 3rd product.
- **Verdict:** Automatable, but `ponytail: manual until 3rd cover` — keep generated `cover-1280x720.png` in `tools/gumroad-autofill/` + `public/tc-cover-gumroad*.png`, manual upload 20s.

## 3. Tags & Category (Share page `…/edit/share`)
- **Current: MANUAL** — `Category Other → Software Development (id 65)` + 10 tags `pwa,pwa template,vanilla js,freelancer,white label,vite,starter template,offline,client work,developer tools`.
- **Can be automated?** YES, with 30 extra lines, but fragile.
  - **Category:** `input#":rd:"` react-select 359 options, `Software Development` id `65`. `__reactFiber` traversal finds `props.options` + `onChange`, but calling `onChange({id:"65",label:"Software Development"}, {action:'select-option'})` → `TypeError: Cannot read properties of undefined (reading 'value')` (handler expects `value` key, not `id`). Tried shapes `{value:"65",label:"Software Development"}` → no error but displayed value stays `Other` (controlled component needs parent state update, not just child onChange).
  - **Tags:** `input#":rf:"` react-select virtual list, `10` existing tags as `button.rounded-full`. Typing `pwa template` + `Enter` via `input.value` + `keydown Enter` or `Input.dispatchKeyEvent` does not create new tag (needs `composition` + `onChange` with correct `action:"create-option"`). Fiber has `onChange` but same `value` issue.
  - **Network:** Hooked `fetch`/`XHR` before Save, but Share save did not trigger a capturable `POST /products/gyhehh` (404 on our manual `fetch` to `/products/gyhehh` with `_method:put`). Real endpoint is likely Inertia `PUT /products/:id` with `product[tags][]` + `product[taxonomy_id]` — would need to capture via `Network.enable` + manual Save, then replay.
- **Verdict:** Automatable via `Input.dispatchKeyEvent` typing + `Network` replay, but `ponytail: manual 30s until 3rd product` — typing 10 tags + selecting Category is faster than 30 lines that break on Gumroad deploy (dynamic `:rd:` IDs rotate).

## 4. Publish
- **Status: AUTOMATED** — `Save and continue` on Product tab sets `is_published:true` (verified `props.product.is_published:true` after save). No extra step.

## Summary — Ponytail Ladder
1. **Automated now (keep):** Product fields + Publish (1 command `fill_gumroad.py`).
2. **Manual now (automate after 3rd use):** Cover, Tags, Category — 2 mins total, `MANUAL_STEPS.md:1` + generated cover. Add `--cover` + `--share` flags to `fill_gumroad.py` + `visual_inspect.py --share` only if you publish >3 products/month.
3. **Never automate:** `tesseract` OCR — `DOM` check is primary; `cover` S3 wait is 3–5s, not worth polling.

**What worked:** Label-based selectors, Tiptap, price diff, `DOM.setFileInputFiles` with home path, `google-chrome --headless --screenshot` for cover.
**What did not:** `/tmp` file path (sandbox), `fiber.onChange` with `id` vs `value`, `fetch /products/gyhehh` 404, `tesseract` not installed.
