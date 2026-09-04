# Deploy to Vercel — Step by Step

## Prerequisites

- Node.js 16+ (use `nvm use 16`)
- A Vercel account (free tier works)
- Git repo (GitHub, GitLab, or Bitbucket)

## Steps

1. **Build the project**

   ```bash
   npm install
   npm run build
   ```

2. **Push to Git**

   ```bash
   git init && git add . && git commit -m "initial"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

3. **Import on Vercel**

   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Git repo
   - Framework: **Vite** (auto-detected)
   - Build command: `npm run build`
   - Output directory: `dist`
   - Click **Deploy**

4. **Done.** Your PWA is live.

## Custom Domain

1. Go to your project → **Settings → Domains**
2. Add your domain
3. Update DNS records as instructed (CNAME or A record)
4. Wait for SSL — automatic via Let's Encrypt

## PWA Installability Checklist

For the browser to show "Install App":

- [x] `manifest.json` served at root (`/manifest.json`)
- [x] `manifest.json` has `name`, `icons`, `start_url`, `display: standalone`
- [x] Icons: 192x192 and 512x512 at minimum
- [x] Service worker registered (`sw.js`)
- [x] HTTPS (Vercel provides this by default)
- [x] Served from a proper domain (not `file://`)

## Technical Notes

- **Node 16 required** — GLIBC 2.27 systems need NVM, not system node
- **Vite 4.5.14** — no newer Vite without upgrading Node
- **Manual PWA** — no vite-plugin-pwa, no workbox. Just a hand-written `sw.js`
- **No build-time injection** — manifest and SW are static files in `public/`
