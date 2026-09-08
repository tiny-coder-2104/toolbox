# Manual Steps Remaining (ponytail: automate after 3 uses)

These 3 fields cannot be reliably automated via DOM without fragile react-select hacks. Do them once manually (2 mins), then the autofill handles the rest forever.

## 1. Cover Image (highest 15x lever)
- File generated: `tools/gumroad-autofill/cover-1280x720.png` (89K, 1280x720) + `cover-680x380.png`
- Also copied to `public/tc-cover-gumroad-1280.png` / `public/tc-cover-gumroad.png`
- Gumroad: Product → Upload → select `cover-1280x720.png` → Save
- Why manual: `input[type=file]` + `DOM.setFileInputFiles` requires Chrome security bypass; file upload is 1-click manual, automation is 50 lines brittle.

## 2. Tags & Category (Share page)
- Gumroad: Product → Share → Category → select `Software Development` (id 65, shows as `Software Development`)
- Tags → remove old 10 (`pwa,vite,vanilla-javascript...`) → add new 10:
  `pwa, pwa template, vanilla js, freelancer, white label, vite, starter template, offline, client work, developer tools`
- Why manual: react-select `id=":rd:"`/`":rf:"` is 359-option virtual list; `DOM.setFileInputFiles` equivalent for react-select is `fiber.onChange` hack that breaks on Gumroad deploy. Manual typing + Enter is 30s.

## 3. Publish
- After cover+tags saved, click `Publish` (or `Save and continue` → `Publish`). Verify `is_published` true via `JSON.parse(document.getElementById('app').dataset.page).props.product.is_published` in console.

## Verification (visual_inspect)
```bash
python3 tools/gumroad-autofill/visual_inspect.py --port 9222          # product edit DOM check
python3 tools/gumroad-autofill/visual_inspect.py --port 9222 --ocr    # + screenshot + tesseract if installed
# ponytail: DOM check is primary; `tesseract-ocr` is `sudo apt install tesseract-ocr` if you want rendered text check
```
Screenshots saved after last run:
- `/tmp/gumroad_product_edit.png` (337K)
- `/tmp/gumroad_cover_1280x720.png` (89K) — generated cover
- `/tmp/gumroad_share.png` (323K)

## Cover Preview
Generated via `file:///tmp/cover.html` → `google-chrome --headless --screenshot` (no new deps, uses existing Chrome).
Design: navy #0F172A, cyan #06B6D4, phone mock + config.js card, badges $0 Hosting/Works Offline/White-Label, tier bar $29|$49|$79.
