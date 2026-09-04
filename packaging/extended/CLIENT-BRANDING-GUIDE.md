# Client Branding Guide — White-Label Steps

Turn the TinyCoder template into your client's branded app.

## Step 1: Remove TinyCoder Branding

### manifest.json

Replace all `TinyCoder` references with client name. Edit `public/manifest.json`.

### Source code

In `src/main.js`:
- `homeView()` — change `<h1>TinyCoder</h1>` and the tagline
- `toolView()` — update header if needed
- Both `footer` elements — replace text

In `src/style.css`:
- Adjust `--accent` and other colors to match client brand

### Favicon & Icons

Replace all icon files with client logo:

| File | Size | Notes |
|------|------|-------|
| `public/favicon.png` | 512x512 | Browser tab icon |
| `public/icons/icon-192.png` | 192x192 | Mobile home screen |
| `public/icons/icon-512.png` | 512x512 | Splash screen |

### Service Worker

Edit `public/sw.js` — update `CACHE_NAME`:

```js
const CACHE_NAME = 'clientapp-v1'
```

This ensures users get fresh assets after a rebuild.

## Step 2: Customize Tool Set

Edit the `TOOLS` object in `src/main.js` to:

- Rename tools to match client context
- Update descriptions
- Add/remove tools as needed

The tools are self-contained functions — each one is independent.

## Step 3: Rebuild & Test

```bash
npm run build
```

Test on mobile before handoff:
- PWA install prompt appears
- Offline mode works
- All tools function correctly
- Colors and branding look right

## Client Handoff Checklist

- [ ] All TinyCoder branding removed
- [ ] Client favicon/icons in place
- [ ] Manifest name and description updated
- [ ] Color scheme matches client brand
- [ ] Service worker cache name updated
- [ ] App tested on iOS and Android
- [ ] Deployed to production
- [ ] Client has access to hosting account
- [ ] Source code delivered (if contracted)
