# Gumroad Edit Page Selectors

## Source
Inspected via CDP on `https://gumroad.com/products/gyhehh/edit` (2026-09-05).
Page is a React SPA with dynamically-generated IDs (`:r4t:`, `:r50:`, etc.) that change on each page load.
**Do NOT rely on React-generated IDs** — use label-based selectors instead.

## Product-Level Fields

| Gumroad Field | Selector Strategy | Current React ID | Notes |
|---|---|---|---|
| Product Name | `label[for]` where label.textContent === "Name" → input | `:r4t:-name` | First "Name" label on page |
| URL Slug | `label[for]` where label.textContent === "URL" → input | `:r50:` | Has placeholder "gyhehh" |
| Call to Action | `label[for]` where label.textContent === "Call to action" → select | `:r54:` | Options: i_want_this_prompt, buy_this_prompt, pay_prompt |
| Summary | `label[for]` where label.textContent === "Summary" → input | `:r55:` | Plain text input |
| Description | `label[for]` where label.textContent === "Description" → div#":r4v:" | `:r4v:` | **Tiptap/ProseMirror contenteditable div** |
| Amount (Price) | `label[for]` where label.textContent === "Amount" → input | `:r57:-price-cents` | In Pricing section |
| Currency | `select[name="Currency"]` | — | USD default |
| Suggested Amount | `label[for]` where label.textContent === "Suggested amount" → input | `:r57:-suggested-price-cents` | |
| Minimum Amount | `label[for]` where label.textContent === "Minimum amount" → input | `:r57:-minimum-amount` | |
| Cover Image | `input[type="file"]` in Cover section | — | **MANUAL** — no automated fill |

## Version-Level Fields (Variants)

| Gumroad Field | Selector Strategy | Current React ID | Notes |
|---|---|---|---|
| Version Name | `label[for]` where label.textContent === "Name" in Versions section → input | `:r68:-name` | |
| Version Description | `label[for]` where label.textContent === "Description" in Versions section → textarea | `:r68:-description` | |
| Additional Amount | `label[for]` where label.textContent === "Additional amount" → input | `:r68:-price` | |
| Max Purchases | `label[for]` where label.textContent === "Maximum number of purchases" → input | `:r68:-max-purchase-count` | |

## Tiptap/ProseMirror Editor (Description)

- Element: `div#":r4v:"` with class `tiptap ProseMirror` and `contenteditable="true"`
- To set content: `editor.innerHTML = html` then dispatch `input` and `blur` events
- The editor uses `react-renderer` for links — may need special handling
- **IMPORTANT**: Setting `innerHTML` works but may not trigger all React state updates. Also try `editor.focus()` after setting.

## Helper Function Pattern (for userscript)

```js
function findByLabel(text) {
  const labels = document.querySelectorAll('label');
  for (const label of labels) {
    if (label.textContent.trim() === text) {
      const forId = label.getAttribute('for');
      if (forId) return document.getElementById(forId);
    }
  }
  return null;
}
```

## ASSUMED Selectors (not verified via CDP)

These fields were not found in the current DOM inspection and may need adjustment:
- Tags input — not found in current page structure
- Custom domain — `input#":r5c:"` (found but may be unstable)
- Refund policy fields — found but not needed for autofill

## Verified vs Assumed

All selectors in the Product-Level and Version-Level tables above were **verified via CDP** on 2026-09-05.
The React-generated IDs are confirmed but unstable — the label-based approach is the recommended strategy.
