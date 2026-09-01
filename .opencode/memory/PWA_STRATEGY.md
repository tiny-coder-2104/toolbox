# PWA Business Strategy

## Product Positioning
Web Toolbox — a clean, fast, ad-free suite of developer utilities that works offline and installs on any phone.

## Target Market
- Developers and sysadmins who need quick utility access
- Security professionals who value privacy (client-side processing)
- People searching for tools like "JSON formatter", "Base64 encoder", "Regex tester"
- Global audience — tools work in any language context

## Distribution
1. **Direct URL** (primary) — share the link, users tap "Add to Home Screen" in browser. No app store.
2. **Google Play** (secondary) — via Trusted Web Activity (TWA) using Bubblewrap/PWABuilder
3. **Microsoft Store** — PWA Builder supports direct listing
4. **App Store** — not directly supported; wrap with Capacitor if needed later

## Monetization
- **One-time purchase** ($3-5) — first sell priority
- **Subscription** ($5/month) — premium features, batch processing, export
- **Future upsells**: API access, custom tool requests, affiliate links to hosting/VPN services

## Cost Advantage
- 50-70% cheaper than native dual-platform development
- No 30% app store commission on direct web sales
- $0 hosting (Netlify free tier)
- $0 payment processing overhead (Gumroad handles it)

## Marketing Channels (All Free)
- Product Hunt ("Show HN")
- Reddit: r/webdev, r/programming, r/SelfHoster, r/DeveloperTools, r/sysadmin, r/networking
- Twitter/X
- SEO: each tool gets a searchable landing page via Google index
- Hacker News

## Competitive Edge
- Ad-free experience (existing tools are ad-cluttered)
- Privacy-first (data never leaves browser)
- Offline-capable (service worker caches everything)
- Clean, fast UI
- Installable PWA (home screen icon, splash screen)

## Market Context
- Global PWA market exceeded $15 billion in 2025
- Major companies (Twitter, Pinterest, Starbucks, Uber) use PWAs
- PWAs cost 50-70% less than native apps
- Users prefer frictionless web installation over app store downloads
- iOS Safari fully supports PWAs as of 2026 (service workers, push notifications, installability)