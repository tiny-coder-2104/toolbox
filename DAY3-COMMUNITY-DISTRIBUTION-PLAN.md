# Day 3: Community Distribution Plan

**Date:** 2026-09-07
**Status:** Ready to execute
**Goal:** Get TinyCoder in front of 5,000+ targeted devs across Reddit, Dev.to, and X
**Cost:** $0

---

## Pre-Flight: What product-reviewer Must Check Before We Post

Before ANY link goes public, verify these. One broken link kills credibility instantly.

| Check | Status | Action |
|-------|--------|--------|
| Live site loads | `toolbox-lilac-three.vercel.app` | Test from incognito — no local cache |
| Blog index loads | `/blog/` path | If 404, fix routing or link to individual articles |
| All 4 blog articles load | Check each URL individually | Broken = immediate removal on Reddit |
| Gumroad listing loads | `tinycoderstudio.gumroad.com/l/gyhehh` | Price shows $29, description renders |
| Free tools work | JSON Formatter, Base64, Regex, URL Encoder, UUID | Test each one — "it doesn't work" = instant credibility death |
| PWA install prompt fires | Android Chrome | Manifest + service worker must trigger install |
| OG images render | Share URL on X/Discord preview | Broken OG image = low CTR on shares |
| UTM params set | Add `?utm_source=reddit&utm_medium=post&utm_campaign=lead_gen_2026` (standard: source ∈ {toolbox,blog,reddit,devto,x}, medium ∈ {free_tool,article,post,thread,cta}, campaign always `lead_gen_2026`) | Track which platform drives traffic |

**Block criteria:** If ANY of these fail, Day 3 goes to fixing, not posting. Don't post a broken product.

---

## Platform 1: Reddit — The Trust Engine

### Strategy: Value-first, link-in-comments, never post title-only

Reddit is where dev tools live or die. The audience is allergic to marketing copy. They'll upvote a terminal screenshot faster than a polished landing page.

### Subreddit Matrix (Day 3 Priority)

| Subreddit | Members | Self-Promo Rule | Day 3 Post Type | Risk |
|-----------|---------|-----------------|-----------------|------|
| r/SideProject | 790K | **Allowed** — show-and-tell format | Launch post: "Built 5 dev tools as a PWA, packaged as template" | Low |
| r/webdev | 3.3M | **9-to-1 rule** — very low tolerance | Comment on existing threads only. NO new post from new account. | High |
| r/PWA | ~50K | Likely permissive (niche) | Tutorial share: "How I made TinyCoder installable on Android" | Low |
| r/indiehackers | 183K | **SHOW IH** flair — one per product | Build-in-public update with metrics | Medium |
| r/javascript | 2.4M | **9-to-1 rule** | Comment mention only, no post | High |
| r/IMadeThis | 60K | Allowed if you built it | "I made 5 offline dev tools in one PWA" | Low |

### Exact Reddit Posts

#### Post 1: r/SideProject (PRIMARY — Launch)

**Title:** "I packaged 5 dev tools into one PWA and sold it as a template — here's what happened"

**Body:**
```
I built TinyCoder — 5 offline dev utilities (JSON formatter, Base64 encoder, Regex tester, URL encoder, UUID generator) as a single PWA.

Stack: Vanilla JS, Vite, zero dependencies. Works offline. Installable on Android/iOS.

Why I built it: I kept losing internet on coffee shop wifi and needed these tools. So I made them all work offline in one app.

What I learned:
- PWA install is smoother than I expected — manifest.json + service worker = done
- Vanilla JS > framework for tools like this (smaller bundle, faster load)
- Live demo sells itself — no marketing page needed

The repo is on GitHub (source-available; licensed per Gumroad tier — Basic/Pro for your own projects, Agency for client work, see LICENSE). Also packaged it as a $29 template on Gumroad for devs who want the source code organized and ready to customize.

Live demo: https://toolbox-lilac-three.vercel.app
GitHub: https://github.com/tiny-coder-2104/toolbox
Gumroad: https://tinycoderstudio.gumroad.com/l/gyhehh

Happy to answer questions about the build process.
```

**Flair:** None required
**Timing:** Saturday 10am ET (weekend project window)
**Post-type:** Text post with links in body (NOT link post)
**Critical:** Reply to EVERY comment within 1 hour. Reddit rewards active OPs.

---

#### Post 2: r/PWA (Tutorial Angle)

**Title:** "How to make any web app installable on Android in 5 minutes — my PWA checklist"

**Body:**
```
I just shipped a PWA and the install process was simpler than I expected. Here's the minimal checklist:

1. manifest.json — name, icons, start_url, display: 'standalone'
2. Register service worker — even a empty one works for install prompt
3. HTTPS — required, Vercel/free hosts handle this
4. Icon sizes — 192x192 and 512x512 minimum

That's it. No Play Store. No review process. Users tap "Add to Home Screen" and it's there.

I wrote a full walkthrough here: https://toolbox-lilac-three.vercel.app/blog/pwa-installable-android.html

Live demo (install it yourself): https://toolbox-lilac-three.vercel.app

Happy to answer questions about PWA setup.
```

**Key:** This is a value-first tutorial post. The link is ONE resource among several tips. Not a pitch.

---

#### Post 3: r/IMadeThis (Show-and-Tell)

**Title:** "I made 5 offline dev tools in one PWA — no dependencies, works without internet"

**Body:**
```
Tools included:
- JSON Formatter/Validator (syntax highlighting, error detection)
- Base64 Encoder/Decoder (UTF-8 safe)
- Regex Tester (live match highlights)
- URL Encoder/Decoder
- UUID Generator (v1 + v4)

Stack: Vanilla JS, Vite, manual service worker. Zero npm dependencies.

Live: https://toolbox-lilac-three.vercel.app

Built it because I needed offline tools on spotty coffee shop wifi. Packaged it as a template on Gumroad ($29) for anyone who wants the source.
```

---

### Reddit Rules Cheat Sheet

| Rule | What It Means | Consequence |
|------|--------------|-------------|
| **90/10 rule** | Max 10% of ALL account activity is self-promo | Shadow ban |
| **No cross-posting same day** | Don't post same content to r/SideProject AND r/webdev same day | Removal |
| **No affiliate links** | Gumroad links are fine (direct), affiliate links are banned | Removal + report |
| **Disclose affiliation** | Always say "I built this" or "Full disclosure: I'm the creator" | Trust signal |
| **Reply to comments** | Reddit rewards active OPs; ghost OPs get flagged | Low visibility |
| **No deleted/reposted** | Don't delete and repost if removed | Ban |

### What NOT to Do on Reddit

1. **Don't post to r/webdev from a new account** — 3.3M members, very low promo tolerance, AutoMod kills new accounts
2. **Don't title-drop the product name** — "TinyCoder is amazing" = removed. "I built 5 offline dev tools" = approved
3. **Don't paste the same post across 5 subreddits** — each post must be rewritten for the specific community's norms
4. **Don't use marketing language** — "game-changing", "revolutionary", "must-have" = instant removal
5. **Don't post and leave** — responding to comments is mandatory. Reddit rewards engagement velocity

---

## Platform 2: Dev.to — The Long-Term SEO Engine

### Strategy: Cross-post from blog with canonical URL → build domain authority

Dev.to has 3M+ registered developers and ~7M monthly visits. Articles rank on Google within 24-48 hours. This is TinyCoder's long-term content play.

### How to Cross-Post

**Step 1: Create Dev.to account** (if not done)
- Sign up at dev.to with GitHub (fastest)
- Set display name and bio
- Upload avatar (use tc-avatar-180.png from brand assets)

**Step 2: Import via URL (canonical method)**
1. Go to dev.to/dashboard → "New Post"
2. Click "Import a post" (bottom right of editor)
3. Paste your blog article URL: `https://toolbox-lilac-three.vercel.app/blog/pwa-installable-android.html`
4. Dev.to imports the content
5. **CRITICAL:** In the editor, check the frontmatter:
   - Set `canonical_url` to your original blog URL
   - Add tags (max 4): `webdev`, `javascript`, `tutorial`, `pwa`
   - Add cover image if not imported

**Step 3: Verify canonical tag**
- Dev.to should show "Originally published at toolbox-lilac-three.vercel.app" at the top
- This tells Google: "The original is on their domain, this is a syndication"
- Protects your blog's SEO ranking

### Dev.to Article Priority (Day 3)

| Article | Dev.to Tags | Why This Order |
|---------|-------------|----------------|
| **Vanilla JS PWA Tutorial** | `javascript`, `tutorial`, `pwa`, `webdev` | Highest search volume, tutorial format performs best |
| **PWA Installable on Android** | `pwa`, `tutorial`, `android`, `webdev` | Matches "how to make PWA installable" search intent |
| **PWA vs Native App** | `pwa`, `mobile`, `javascript`, `webdev` | Decision-stage content, drives clicks |
| **JSON Formatter Offline** | `javascript`, `tools`, `tutorial`, `webdev` | Niche but high-intent keyword |

### Dev.to Publishing Rules

| Rule | Detail |
|------|--------|
| **Max 4 tags** | Pick from popular tags: `javascript`, `webdev`, `tutorial`, `pwa`, `react`, `node` |
| **Canonical URL** | ALWAYS set to your original blog URL. This is non-negotiable for SEO. |
| **Cover image** | Required for Top 7 badge consideration. Use 1000x420 minimum. |
| **Code blocks** | Dev.to uses fenced code blocks (```) — verify formatting after import |
| **No paywalls** | Dev.to content must be free. Gumroad links in body are fine. |
| **Series option** | Can create a "TinyCoder PWA Series" to link articles together |

### Dev.to Posting Schedule

| Day | Article | Time (ET) |
|-----|---------|-----------|
| Day 3 (Sat) | Vanilla JS PWA Tutorial | 9:00 AM |
| Day 4 (Sun) | PWA Installable on Android | 9:00 AM |
| Day 5 (Mon) | PWA vs Native App | 9:00 AM |
| Day 6 (Tue) | JSON Formatter Offline | 9:00 AM |

**Why 1/day?** Dev.to penalizes spamming. One quality article per day builds authority. Cross-posting 4 articles at once triggers "content farm" detection.

---

## Platform 3: Twitter/X — The Visibility Driver

### Strategy: Thread format, hook → value → CTA, 0-2 hashtags

X threads get 3.5x more impressions than single tweets in 2026. The algorithm rewards dwell time and reply-to-impression ratio.

### Thread 1: The PWA Builder Thread (Day 3)

**Tweet 1/7 (Hook):**
```
I turned 5 offline dev tools into a PWA that installs to your home screen.

No React. No Next.js. No npm. Just vanilla JS + a manifest.json.

Here's how I built it (and why PWAs are underrated) 👇
```

**Tweet 2/7:**
```
The tools:

• JSON formatter with syntax highlighting
• Base64 encoder (UTF-8 safe — handles emoji)
• Regex tester with live match highlights
• URL encoder/decoder
• UUID v1 + v4 generator

All work offline. No server needed.
```

**Tweet 3/7:**
```
The stack:

• Vanilla JS (ES modules)
• Vite 4.5 (zero config)
• Manual service worker (not Workbox)
• Hash router (30 lines)

Total bundle: 12KB gzipped.

No React. No dependencies. Just works.
```

**Tweet 4/7:**
```
Making it installable was simpler than I expected:

1. manifest.json (name, icons, display: standalone)
2. Register service worker
3. HTTPS (Vercel handles this)
4. Icon: 192x192 + 512x512

That's it. No Play Store. No review.
Users tap "Add to Home Screen" → done.
```

**Tweet 5/7:**
```
Why PWAs > Native for dev tools:

• No app store approval
• Instant updates (no 24hr review)
• Offline-first by default
• 12KB vs 50MB+ native
• Works on Android + iOS + desktop

For utility tools, PWA wins every time.
```

**Tweet 6/7:**
```
Live demo (install it yourself):

https://toolbox-lilac-three.vercel.app

Open on Android → tap "Add to Home Screen"
It installs like a native app. Try it.
```

**Tweet 7/7:**
```
I also packaged the source code as a template:

$29 on Gumroad — organized, documented, ready to customize.

If you're building your own dev tool PWA, this saves 8+ hours of setup.

https://tinycoderstudio.gumroad.com/l/gyhehh

Questions? Drop them below 👇
```

**Hashtags (0-2 only):** `#PWA` or `#BuildInPublic`
**Timing:** Thursday 9am ET (peak dev engagement)

---

### Thread 2: The "Broke Dev" Story Thread (Day 4-5)

Use the existing `x-thread-thursday-condensed.md` content. It's the founder story angle — more emotional, broader appeal.

**When to post:** Thursday or Friday, 9am ET
**Why:** Personal stories get 2.8x higher engagement than product threads on X

---

### Twitter/X Rules for Day 3

| Rule | Detail |
|------|--------|
| **0-2 hashtags** | X penalizes hashtag stuffing. 1 relevant hashtag max. |
| **Hook in first 140 chars** | Mobile shows preview before "Show more" |
| **Reply to every comment** | Reply-to-impression ratio is #1 algorithm signal |
| **Don't post and ghost** | Stay online for 30 min after posting to reply |
| **No link in first tweet** | Put link in tweet 6 or 7. First tweet = pure hook. |
| **Space tweets 2-3 min** | Don't fire all 7 tweets instantly. Let each breathe. |

---

## Day 3 Execution Timeline — STAGGERED (48h rule)

**Hard rule: max 1 launch-type post per 48h, max 1 subreddit per day, zero DMs, human hits submit on every post. The same-day blitz below is RETIRED — it risks same-day multi-sub removal and shadowbans. New queue:**

| Day | Time (ET) | Action | Platform |
|-----|-----------|--------|----------|
| Day 3 (Sat) | 9:00 AM | Post PWA tutorial to r/SideProject (PRIMARY launch) | Reddit |
| Day 3 (Sat) | 10:00 AM–8:00 PM | Monitor + reply to every comment, no other posts | Reddit |
| Day 5 (Mon) | 9:00 AM | Post PWA checklist to r/PWA (tutorial angle, fresh copy) | Reddit |
| Day 5 (Mon) | 11:00 AM | Post Thread 1 (PWA Builder) to X | X |
| Day 7 (Wed) | 9:00 AM | Cross-post ONE article to Dev.to with canonical URL set | Dev.to |
| Day 7 (Wed) | 12:00 PM | Post "I made 5 offline tools" to r/IMadeThis | Reddit |
| Daily | — | 3–5 value-only comments on r/webdev + r/javascript threads (NO links until 50+ comment karma) | Reddit |

### Karma-farming checklist (before FIRST launch post)
- [ ] Account age ≥ 7 days, verified email.
- [ ] 50+ karma earned from genuine comments in target subs (no links, no self-promo).
- [ ] Read each target sub's self-promo rules; r/webdev + r/javascript = comments only, never a new post from a new account.
- [ ] Every post discloses affiliation ("I built this") in the first 3 lines.

### RETIRED same-day blitz (kept for reference — DO NOT EXECUTE)

### Morning (9am-12pm ET / 9pm-12am Davao)

| Time | Action | Platform |
|------|--------|----------|
| 9:00 AM ET | Post PWA tutorial to r/SideProject | Reddit |
| 9:05 AM ET | Cross-post Vanilla JS PWA Tutorial to Dev.to | Dev.to |
| 9:30 AM ET | Post PWA checklist to r/PWA | Reddit |
| 10:00 AM ET | Monitor both Reddit posts — reply to every comment | Reddit |
| 11:00 AM ET | Post Thread 1 (PWA Builder) to X | X |
| 11:30 AM ET | Monitor thread — reply to every reply | X |

### Afternoon (12pm-5pm ET / 12am-5am Davao)

| Time | Action | Platform |
|------|--------|----------|
| 12:00 PM ET | Post "I made 5 offline tools" to r/IMadeThis | Reddit |
| 1:00 PM ET | Engage in 3-5 r/webdev threads (comment only, no links) | Reddit |
| 2:00 PM ET | Engage in 3-5 r/javascript threads (comment only) | Reddit |
| 3:00 PM ET | Check Dev.to article views/reactions | Dev.to |
| 4:00 PM ET | Reply to any new comments across all platforms | All |

### Evening (5pm-10pm ET)

| Time | Action | Platform |
|------|--------|----------|
| 5:00 PM ET | Engage in 2-3 r/PWA threads | Reddit |
| 6:00 PM ET | Post 1 standalone value tweet (no links) | X |
| 8:00 PM ET | Final check — reply to all remaining comments | All |

---

## Risk Mitigation

### Reddit Bans — Prevention

| Risk | Prevention | Recovery |
|------|-----------|----------|
| AutoMod removes post | Build 50+ karma from comments BEFORE posting | Modmail: "New to community, didn't realize rule, will follow" |
| Shadow ban | Never use multiple accounts. Never upvote own content. | Check reddit.com/appeal — if form loads, you're shadow banned |
| Perma ban from sub | Never repost deleted content. Never argue with mods. | Create new account + wait 30 days. Last resort. |
| "Spam" report from users | Always disclose affiliation. Lead with value. | Respond graciously to criticism. |

### Dev.to — Prevention

| Risk | Prevention | Recovery |
|------|-----------|----------|
| Duplicate content penalty | ALWAYS set canonical_url to original blog | Edit article, add canonical in frontmatter |
| Low engagement | Write tutorials, not product pitches | Rewrite as "How I built X" not "Buy X" |
| Formatting broken after import | Preview before publishing, fix code blocks | Edit in Dev.to editor directly |

### X/Twitter — Prevention

| Risk | Prevention | Recovery |
|------|-----------|----------|
| Low impressions | Hook tweet must be under 140 chars visible | Rewrite opening line with number/contrarian |
| No engagement | Reply to 10-20 larger accounts daily (value-add) | Build reply history before posting threads |
| Account flagged | Don't post 7 tweets in 60 seconds. Space 2-3 min. | Reduce posting frequency for 7 days |

---

## What Product-Reviewer Should Verify

Before going live on Day 3, product-reviewer must check:

1. **Free tools function correctly** — JSON formatter parses valid/invalid JSON, Base64 handles unicode, Regex shows live highlights
2. **Gumroad listing renders** — Price $29, description complete, download works after purchase
3. **Blog articles load** — All 4 articles render correctly, code blocks display properly
4. **Mobile experience** — Site loads fast on mobile, PWA install prompt fires on Android
5. **Links work** — Every URL in Reddit/X/Dev.to posts resolves to working page
6. **No console errors** — Check browser console on live site, fix any JS errors
7. **OG tags present** — Share URLs on X to verify preview images render

**Block if:** Any free tool is broken, Gumroad listing fails, or live site has console errors.

---

## Success Metrics (Day 3 End)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Reddit upvotes | 10+ across all posts | Reddit post karma |
| Reddit comments | 15+ total | Reply count |
| Dev.to views | 200+ on first article | Dev.to dashboard |
| X impressions | 1,000+ on thread | X Analytics |
| X engagements | 30+ (likes + replies + retweets) | X Analytics |
| Site visits from UTM | 50+ unique visitors | GA4 (utm_source=reddit/devto/twitter) |
| Gumroad clicks | 10+ | Gumroad analytics |
| Email captures | 3+ ($0 free tool) | Gumroad $0 product downloads |

---

## Post-Day 3: What Comes Next

| Day | Action | Purpose |
|-----|--------|---------|
| Day 4 | Cross-post remaining 3 articles to Dev.to (1/day) | SEO compound |
| Day 5 | Post Thread 2 (founder story) to X | Emotional hook, broader reach |
| Day 6 | Post "What I learned building PWAs" to r/webdev (as comment in relevant thread) | Borrow distribution |
| Day 7 | Analyze all metrics — double down on what worked | Optimize before Phase 3 |

---

*This plan is designed for a solo founder with $0 budget. Every action requires ~2 hours of active time. Total Day 3 investment: 6-8 hours spread across the day.*
