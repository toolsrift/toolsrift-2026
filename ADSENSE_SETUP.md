# Google AdSense — Setup Guide for ToolsRift

This is the one-page guide for getting AdSense approved and live on toolsrift.com.

Everything in **Phase A (already done)** is the work that maximizes your approval chances. **Phase B** is what you do *after* AdSense approves you and gives you a publisher ID.

---

## ✅ Phase A — What's already done (May 2026)

These are the changes that have been made to give AdSense reviewers what they need:

### 1. Original written content on every page
Every category page (text, pdf, json, images, etc. — 22 in total) now has **800–1200 words of original educational content** rendered server-side beneath the tool widget. AdSense crawlers see real article content, not just a JavaScript tool. Content is structured as:
- **About [category]** — what these tools are, who they help
- **Why ToolsRift** — privacy, speed, quality differentiation
- **How it works** — 4-step usage guide
- **Use cases** — 7 concrete examples
- **FAQs** — 5 detailed questions with full answers
- **Related categories** — internal cross-links for SEO

Implementation: [components/CategoryContent.jsx](components/CategoryContent.jsx) + [lib/categoryContent.js](lib/categoryContent.js).

### 2. Homepage article content
Homepage now has a full article-style section (What is ToolsRift, How it works, Our principles, Why we built it, 8-question FAQ) rendered server-side via [components/HomepageContent.jsx](components/HomepageContent.jsx). AdSense crawler hits the homepage first — this is what they see.

### 3. Required legal pages
All AdSense-required pages exist and are reachable from every page footer:
- [pages/about.js](pages/about.js) — About
- [pages/contact.js](pages/contact.js) — Contact (with contact@toolsrift.com)
- [pages/privacy-policy.js](pages/privacy-policy.js) — Privacy Policy
- [pages/terms.js](pages/terms.js) — Terms of Service
- [pages/disclaimer.js](pages/disclaimer.js) — Disclaimer (covers finance/health/legal/security)
- [pages/cookies.js](pages/cookies.js) — Cookie Policy (with cookie table)

### 4. Sitemap updated
[public/sitemap.xml](public/sitemap.xml) now lists all 30 indexable pages including the 4 new legal pages.

### 5. Footers updated
The main site footer (in `components/toolsrift-main.jsx`) now has a dedicated **Legal** column linking to Privacy, Terms, Cookies, Disclaimer. Every legal page footer also links to every other legal page — so a reviewer landing on any page is one click away from all of them.

### 6. Structured data (JSON-LD)
- `Organization` + `ContactPage` schema on /contact
- `FAQPage` schema on homepage and on every category page
- `HowTo` schema on every category page
- `BreadcrumbList` schema on every legal page
- `WebSite` schema with SearchAction on homepage

This helps Google understand the site is real, structured and trustworthy.

---

## 🔜 Phase B — After you receive your AdSense publisher ID

You'll get an ID like `ca-pub-1234567890123456`. Here's exactly what to do:

### Step 1 — Add `ads.txt` (5 minutes)
Create `public/ads.txt` with one line:
```
google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0
```
Replace `1234567890123456` with your actual publisher ID. Vercel will serve it at `https://toolsrift.com/ads.txt` automatically. AdSense will verify it within 24 hours.

### Step 2 — Add the AdSense script to every page (10 minutes)
Edit [pages/_document.js](pages/_document.js) and add inside `<Head>`:
```jsx
<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
  crossOrigin="anonymous"
/>
<meta name="google-adsense-account" content="ca-pub-XXXXXXXXXXXXXXXX" />
```
Replace `XXXXXXXXXXXXXXXX` with your publisher ID. This single script loads ads anywhere `<ins class="adsbygoogle">` appears on the page.

### Step 3 — Place ad slots in your tool pages (15 minutes)
The recommended ad placements:

**A. Top of every category page** (after the breadcrumb, before the tool):
```jsx
<ins className="adsbygoogle"
  style={{ display: 'block' }}
  data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
  data-ad-slot="YOUR-SLOT-ID-1"
  data-ad-format="auto"
  data-full-width-responsive="true" />
<script dangerouslySetInnerHTML={{__html: '(adsbygoogle = window.adsbygoogle || []).push({});'}} />
```

**B. Mid-content (between tool result and FAQ in CategoryContent.jsx):**
Drop the same `<ins>` block into [components/CategoryContent.jsx](components/CategoryContent.jsx) between the use-cases section and the FAQ section. You'll get one well-placed mid-content ad on every category page.

**C. Homepage leaderboard** (in HomepageContent.jsx, between principles and FAQ).

You get the slot IDs from your AdSense dashboard → Ads → By ad unit.

### Step 4 — Wait for the first ads (1–24 hours)
After steps 1–3 are deployed, AdSense usually starts serving ads within an hour. Real revenue starts accumulating with traffic.

---

## 📋 AdSense application checklist

Before clicking "Apply" on AdSense, verify:

- [ ] Site is live at toolsrift.com over HTTPS (already done — Vercel)
- [ ] Homepage loads in under 3 seconds (already done)
- [ ] All 22 category pages have 800+ words of original content (done in Phase A)
- [ ] Contact page exists and is reachable from footer (done)
- [ ] Privacy Policy mentions Google AdSense and cookies (done)
- [ ] Terms of Service exists (done)
- [ ] Disclaimer exists, with finance/health/legal disclaimers (done — these are *especially* important since you have EMI and TDEE calculators)
- [ ] No prohibited content: adult, violence, hate, copyright-infringing, hacking tools used for malicious purposes
- [ ] Site is at least 2–6 weeks old with some real traffic (AdSense prefers established sites)
- [ ] Google Search Console verified for toolsrift.com — submit sitemap.xml there

### Applying

1. Go to **https://adsense.google.com/start**
2. Enter `toolsrift.com` as the site
3. Use `financialbrains.ai@gmail.com` (your registered email)
4. Select India as the country
5. AdSense will give you a verification snippet → drop it in `pages/_document.js`
6. Wait. Approval usually takes 2–14 days.

---

## 🚫 Common AdSense rejection reasons (and why we should be safe)

| Rejection reason | Our defense |
|------------------|-------------|
| Low value content | 22 category pages × 800-1200 words + homepage article content |
| Insufficient content | 30 indexable pages, all with real text |
| Site does not comply with policies | Disclaimer + Terms + Privacy + Cookies all in place |
| Navigation issues | Footer with all legal pages on every page |
| Copyright issues | All content is original; tools use open-source libraries |
| Health/finance without disclaimer | Detailed disclaimer page with section-by-section caveats |
| Privacy policy missing AdSense mention | Already explicitly mentions AdSense, cookies, GA |

---

## 💰 Optimizing earnings after approval

Once ads are running, these moves typically increase RPM (revenue per 1000 impressions):

1. **Auto-ads ON for first month, then targeted ads** — Auto-ads lets AdSense pick placements; gives you a baseline. After 30 days, replace with manual placements based on which slots earn the most.
2. **Top placements perform best** — The ad above the tool (top of category page) consistently gets the highest CTR on tools sites.
3. **In-article ads work well in our CategoryContent** — Drop one between use-cases and FAQ.
4. **Don't over-do it** — More than 3 ads per page hurts UX *and* RPM. AdSense is smart; quality beats quantity.
5. **Match colors to the dark theme** — In your ad unit settings, set background to `#0D1117` and text to `#F1F5F9` for a native look.
6. **High-value categories**: finance, business, legal tools → typically 2-5× higher CPMs than entertainment/fancy text. The pages we have (`/financecalc`, `/business`, `/devtools`, `/pdf`) are gold mines.

---

## 🛠️ Files to know

| What | Where |
|------|-------|
| Per-category content (edit to add new categories) | `lib/categoryContent.js` |
| Content rendering | `components/CategoryContent.jsx` |
| Homepage article + FAQ | `components/HomepageContent.jsx` |
| Sitemap (add new pages here) | `public/sitemap.xml` |
| Robots | `public/robots.txt` |
| Site-wide footer | `components/toolsrift-main.jsx` → `LandingFooter` |
| AdSense script (add here in Phase B) | `pages/_document.js` |
| `ads.txt` (create in Phase B) | `public/ads.txt` |

---

## ❓ Questions

Email contact@toolsrift.com or ping the dev who set this up.

*Last updated: May 2026*
