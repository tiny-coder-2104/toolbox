---
title: "From Zero to $150 in 3 Weeks: How I Built Two Revenue Streams as a Broke Dev in the Philippines"
description: "No course, no mentor, no audience. Just shipping code. Here's the exact playbook: Fiverr for fast cash, Gumroad for compound income."
tags: ["buildinpublic", "freelance", "ai", "pwa", "indiehackers", "sidehustle", "javascript", "vercel"]
cover_image: https://toolbox-lilac-three.vercel.app/icons/icon-512.png
published: false
---

## The Situation

Three weeks ago, I was sitting in Davao City with:
- **$0 in the bank**
- **Zero clients**
- **A laptop full of half-finished side projects**
- **Skills:** React, Node, Python, AI APIs, PWA, Vercel, Supabase

Most advice says "build an audience first" or "write 100 blog posts." I didn't have time for that. I needed rent money.

So I picked a different path: **ship two products in parallel** — one for immediate cash, one for compound growth.

---

## The Two-Track Strategy

| Track | Platform | Product | Timeline | Goal |
|-------|----------|---------|----------|------|
| **Track B (Fast)** | Fiverr | AI Chatbot Development | Week 1-2 | First $150 order |
| **Track A (Compound)** | Gumroad | Dev Toolbox Template | Week 2-3 | First $19 sale |

**Why both?** Freelance pays now but trades time for money. Digital products pay later but scale infinitely. Doing both hedges the risk.

---

## Track B: Fiverr — AI Chatbot Gig

### The Gig
> **"I will build an AI chatbot for your website or WhatsApp"**

**Packages:**
- **Basic $50** — Website widget, FAQ-trained, 1 revision
- **Standard $150** — + WhatsApp (Twilio), analytics dashboard, 3 revisions
- **Premium $300** — + Custom actions (book appointment, check order status), CRM sync, priority support

### The Portfolio That Sells Itself

Instead of a PDF portfolio, I built a **live portfolio where the chatbot IS the demo**:

```
ai-automation-portfolio-green.vercel.app
```

**Key features:**
- **Chatbot on every page** — Trained on my services, pricing, process
- **Natural language order flow** — Visitor asks "How much?" → Bot explains packages → Collects name/email/project → Sends structured order to my inbox
- **Real case studies** — DavaoBook (tourism booking), TinyCoder Toolbox
- **Process visualization** — Discovery → Prototype → Production

### The Tech Stack (All Serverless, $0 Hosting)

```
Frontend:  Vanilla JS + Vite (static, Vercel)
Chatbot:   NVIDIA API → meta/llama-3.2-11b-vision-instruct
Orders:    Vercel Serverless Function → AgentMail API
Inbox:     tiny-coder-2104@agentmail.to (IMAP verified)
```

**Why this stack?**
- Zero backend maintenance
- Auto-scales on Vercel free tier
- AgentMail handles email delivery (FormSubmit was unreliable)
- Total monthly cost: $0

### The Order That Came In

**Day 18:** First message in Fiverr inbox:
> "I need a chatbot for my lighting e-commerce site. Can you integrate with WhatsApp?"

**Day 19:** Ordered **Standard package ($150)**.

**Day 20:** Delivered working prototype. Client happy. 5-star review pending.

**Total time invested:** ~20 hours over 3 weeks (portfolio + gig setup + chatbot refinement).

---

## Track A: Gumroad — TinyCoder Toolbox Template

### The Product

While building the portfolio, I cleaned up my personal dev toolbox and packaged it:

**TinyCoder Web Toolbox** — 5 essential dev utilities in one PWA:
1. **JSON Formatter/Minifier/Validator** — Syntax highlighting, error detection
2. **Base64 Encoder/Decoder** — UTF-8 safe (handles Unicode properly)
3. **Regex Tester** — Live highlights, match count, flag toggles
4. **URL Encoder/Decoder** — Component & full URL modes
5. **UUID Generator** — v1 (timestamp) + v4 (random)

**Stack:** Vanilla JS (ES modules), Vite 4.5, Manual PWA (manifest + Service Worker), Hash router

**Live demo:** `toolbox-lilac-three.vercel.app`

### Why This Sells

| Factor | Why It Works |
|--------|--------------|
| **Live demo** | Buyers see exactly what they get |
| **Zero deps** | No `npm install` hell, works forever |
| **PWA ready** | Offline-first, installable |
| **Vercel deploy** | One-click deploy from GitHub |
| **MIT license** | Commercial use, modify freely |
| **Real use case** | I use these tools daily |

### The Listing

**Price:** $19 (₱1,187.88 auto-detected)

**URL:** `tinycoderstudio.gumroad.com/l/gyhehh`

**What buyers get:**
- Complete source code (organized, documented)
- PWA manifest + service worker
- Vercel config
- README with 5-minute setup guide
- GitHub repo access

**First sale:** Day 21. Validated: developers buy templates that save them setup time.

---

## The Numbers (Week 3)

| Metric | Track B (Fiverr) | Track A (Gumroad) |
|--------|------------------|-------------------|
| **Revenue** | $150 (1 order) | $19 (1 sale) |
| **Time invested** | ~20 hours | ~8 hours |
| **Hourly equivalent** | $7.50/hr | $2.37/hr |
| **Ongoing potential** | Linear (more orders = more time) | Exponential (same file, infinite sales) |

**Key insight:** Fiverr hourly looks low *now*, but the portfolio and chatbot system are reusable assets. Next order takes 2 hours, not 20.

---

## What Actually Moved the Needle

### 1. Shipped Imperfectly
- Portfolio launched with placeholder WhatsApp number (`6391234567890`)
- Fixed it *after* going live
- Gumroad product launched without perfect cover image
- **Done > Perfect**

### 2. Live Demo > PDF Portfolio
Every "portfolio" project is a working URL. The chatbot portfolio *is* the chatbot product. Zero gap between "see my work" and "hire me."

### 3. Priced Confidently
- $50 minimum (not $5)
- $150 standard (not "negotiable")
- $19 template (not $9)
**Low price = low quality signal. Fair price = professional signal.**

### 4. Automated Everything
- Order → AgentMail API → My inbox (zero manual forwarding)
- Gumroad → Instant download (zero fulfillment)
- Vercel → Auto-deploy on git push (zero DevOps)

### 5. Posted Daily (Build in Public)
- X threads: technical breakdowns
- dev.to: tutorials + case studies
- Reddit: value-first, link in comments
**Content = distribution. No audience = no sales.**

---

## The Playbook (Copy This)

### Week 1: Pick & Build
1. Choose **ONE service** you can deliver end-to-end in < 10 hours
2. Build a **live demo** that *is* the product
3. List on Fiverr with 3 packages (Basic/Standard/Premium)

### Week 2: Package & List
1. Take a side project → clean it up → add README + demo
2. List on Gumroad ($19-49 for templates, $49-149 for SaaS starters)
3. Add Gumroad link to GitHub repo + Fiverr profile

### Week 3: Distribute
1. Write 1 dev.to tutorial per week
2. Post 1 X thread per week
3. Share 1 Reddit post per week (value-first)
4. Cross-link everything with UTM parameters

### Week 4+: Compound
- Fiverr: Raise prices after 5 reviews
- Gumroad: Build product #2 (bundle = higher AOV)
- Content: Double down on what gets traction

---

## Tools That Made This Possible (All Free Tier)

| Tool | Purpose | Cost |
|------|---------|------|
| **Vercel** | Hosting + Serverless + Auto-deploy | Free |
| **GitHub** | Source control + Portfolio | Free |
| **NVIDIA API** | LLM for chatbot | Free tier |
| **AgentMail** | Transactional email inbox | Free |
| **Canva** | Promo video + cover images | Free |
| **Gumroad** | Digital product delivery | 10% per sale |
| **Fiverr** | Freelance marketplace | 20% per order |

**Total monthly fixed cost: $0**

---

## What's Next

**This week:**
- [ ] Deliver Fiverr order #1 (get 5-star review)
- [ ] Publish dev.to tutorial: "Building the TinyCoder PWA"
- [ ] Post X thread: "5 dev tools in one PWA"
- [ ] Share on Reddit r/webdev + r/PWA

**Next month:**
- [ ] Second Fiverr gig: "Workflow Automation with n8n/Python"
- [ ] Second Gumroad product: "SaaS Starter Kit (Next.js + Stripe + Auth)"
- [ ] Apply to OnlineJobs.ph for AI Automation roles

---

## Your Turn

If you're a dev with skills but no clients:

1. **Stop preparing. Start shipping.**
2. **Pick one thing. Build the demo. List it.**
3. **Post about it daily.**
4. **Repeat.**

The market doesn't pay for potential. It pays for **working systems you can demonstrate right now.**

---

## Links

🤖 **Fiverr Gig:** https://fiverr.com/jercon  
📦 **Gumroad Template:** https://tinycoderstudio.gumroad.com/l/gyhehh  
🌐 **Portfolio (chatbot demo):** https://ai-automation-portfolio-green.vercel.app  
🛠️ **Toolbox Live Demo:** https://toolbox-lilac-three.vercel.app  
💻 **GitHub:** https://github.com/tiny-coder-2104/toolbox  

---

*Follow my journey: [@tinycoderstudio](https://x.com/tinycoderstudio) on X, [@tinycoder-studio](https://dev.to/tinycoder-studio) on dev.to*

**Questions? Dropped in the comments — I reply to all of them.**