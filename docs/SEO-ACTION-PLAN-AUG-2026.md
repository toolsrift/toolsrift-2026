# ToolsRift SEO Action Plan — August 2026

> **Source data:** Google Search Console exports, 2026-08-01
> (Performance last 28 days · Coverage · Crawl stats last 90 days)
> **Goal:** 500 organic Google clicks in the next 30 days
> **Analysis date:** 2026-08-01

---

## 1. Executive summary

**The verdict: your metadata is fine. Your site is invisible to Google's crawler by design.**

Not one of your 1,136 tool pages has a single crawlable `<a href>` link pointing to it
from anywhere on the site — not from the homepage, not from `/tools`, not from any
category page, not in the raw HTML, and not in the rendered DOM. Every tool tile is a
`<motion.div role="button" onClick={...}>`. Google can only find tool pages through
`sitemap.xml`, and sitemap-only URLs are the lowest-priority crawl class Google has.

That single defect explains almost every number in your export:

| Symptom in GSC | Cause |
|---|---|
| 296 pages "Discovered – currently not indexed" | Orphan URLs, sitemap-only |
| 48 pages "Crawled – currently not indexed" | No internal authority → judged low value |
| Average position **72** across 831 indexed pages | Zero internal PageRank reaching tool pages |
| 19 clicks / 8,945 impressions (CTR **0.21 %**) | Nothing ranks above page 6 |
| 46.65 % of crawl budget spent on JavaScript | `ssr:false` on every tool page |

You are not being penalised. You have never actually been *linked*.

**The good news:** impressions are compounding fast — 1,930 (week of Jul 2) → 4,798
(week of Jul 23), and Jul 29 alone hit 1,130 impressions. Google *wants* to rank this
site. It just cannot reach it. The fixes below are structural, not creative, and most
land in a single week.

---

## 2. Where you are today

### Performance — last 28 days (Jul 2 – Jul 29)

```
Clicks           19
Impressions   8,945
CTR           0.21 %
Position       71.7
```

**Trend (weekly):**

| Week | Impressions | Clicks | CTR |
|---|---|---|---|
| Jul 2 – 8 | 1,069 | 0 | 0 % |
| Jul 9 – 15 | 1,443 | 3 | 0.21 % |
| Jul 16 – 22 | 1,636 | 0 | 0 % |
| Jul 23 – 29 | 4,798 | 15 | 0.31 % |

Impressions roughly tripled in the final week. **Momentum is real.**

### Position distribution — this is the whole story

| Position band | Pages | Impressions | Share |
|---|---|---|---|
| 1–3 | 3 | 7 | 0.1 % |
| 4–10 | 27 | 38 | 0.4 % |
| 11–20 | 21 | 107 | 1.2 % |
| 21–30 | 26 | 128 | 1.4 % |
| 31–50 | 109 | 798 | 8.8 % |
| **51–80** | **290** | **5,422** | **59.6 %** |
| 81+ | 122 | 2,196 | 24.1 % |

**83.7 % of your impressions are at position 51 or worse.** At position 51+, CTR is
effectively 0 %. You are not losing clicks to bad titles — you are simply not on any
page a human ever reaches.

### Coverage

```
Indexed                                831
Not indexed                            359
  ├─ Discovered – currently not indexed   296   ← orphan pages
  ├─ Crawled – currently not indexed       48
  ├─ Not found (404)                        7
  ├─ Alternative page w/ proper canonical    6
  └─ Page with redirect                      2
Sitemap URLs                         1,175
Tools in registry                    1,136
```

Indexing jumped 256 → 831 on Jul 11 when the dynamic tool routes landed. It has been
**flat ever since**. The remaining 296 are stuck in the discovery queue.

### Crawl stats (90 days)

| Metric | Value | Read |
|---|---|---|
| Requests to `toolsrift.com` | 2,434 | — |
| Requests to `www.toolsrift.com` | 492 | **17 % of budget wasted on a duplicate host** |
| HTML share of requests | 46.86 % | — |
| **JavaScript share of requests** | **46.65 %** | Half your crawl budget is bundles |
| Purpose: Refresh / Discovery | 74 % / 26 % | Google is re-crawling, not finding new |
| Avg response time trend | 263 ms → 542 ms → 582 ms | Rising; suppresses crawl rate |
| 404 rate | 1.16 % | 7 known bad URLs |

### Devices — the hidden signal

| Device | Clicks | Impressions | CTR |
|---|---|---|---|
| Mobile | 11 | 804 | **1.37 %** |
| Desktop | 7 | 8,094 | **0.09 %** |
| Tablet | 1 | 47 | 2.13 % |

Mobile converts **15× better** than desktop at the same average position. 90 % of your
impressions are desktop and they produce almost nothing. Whatever ranking you do win,
mobile is where the clicks come from.

---

## 3. Root cause analysis

### 🔴 P0-1 — No crawlable internal links exist. Anywhere.

**Evidence (raw server HTML, fetched live 2026-08-01):**

```
GET https://toolsrift.com/          →  0 tool links,  1,119 words
GET https://toolsrift.com/devtools  →  0 tool links,    929 words
GET https://toolsrift.com/tools     →  0 tool links,     46 words   ← empty shell
```

**Evidence (rendered DOM, after JS executes):** a `/devtools` render exposes **19 total
anchors**, of which 6 point at tool URLs. The 55 tool tiles render as:

```jsx
// components/shared/CategoryDashboard.jsx:31
<motion.div role="button" onClick={() => onToolClick(t.id)}>

// components/shared/ToolCard.jsx:56
<motion.div role="button" onClick={onClick}>
```

`role="button"` is an accessibility hint. It is **not a link**. Googlebot does not click
buttons and does not execute `onClick` handlers to discover URLs.

**Consequence:** all 1,136 tool URLs are orphans. This is the direct, textbook cause of
"Discovered – currently not indexed" and of your position-72 average.

---

### 🔴 P0-2 — The `<a href>` links that *do* exist point to hash URLs, not real URLs

Where anchors are used, they target the old hash router:

```jsx
// components/shared/ToolPageLayout.jsx:300
<motion.a href={`${theme.pageRoute}#/tool/${t.id}`}>
```

`href="/devtools#/tool/cidr-calc"` is, to Google, **the same URL as `/devtools`**.
Fragments are stripped. So even your "related tools" and sidebar links pass zero
authority to the clean `/devtools/cidr-calc` URL you actually want ranked.

72 occurrences of `#/tool/` across 36 component files.

---

### 🔴 P0-3 — The server-rendered SEO block is `display:none` in the rendered DOM

```jsx
// pages/[category]/[tool].js:280
<div style={{ display: ready ? 'none' : 'block', ... }}>
```

`ready` flips true on `setTimeout(..., 0)`. Google's Web Rendering Service indexes the
**rendered** DOM. Verified live: the `<h1>` on `/devtools/cidr-calc` reports
`offsetParent === null` — hidden.

So your H1, your how-to, your FAQ, and your only 6 internal tool links are all present
in the raw HTML and all **hidden after hydration**. Google systematically discounts
`display:none` content.

---

### 🔴 P0-4 — The hash bridge loses its race on cold loads → wrong page indexed

On a **cold** first navigation to `/devtools/cidr-calc` (verified live):

```
location.hash    ""                                   ← bridge lost the race
document.title   "Free Developer Tools — ToolsRift"   ← generic CATEGORY title
visible H1       none (SEO fallback is display:none)
visible content  the Developer Tools category dashboard
```

On a **warm** reload the same URL works correctly. The `[tool].js` bridge guards the
hash for a fixed **1,200 ms** window (`pages/[category]/[tool].js:194`) and races
Next.js's post-hydration URL reconciliation.

Googlebot renders cold, throttled, on shared infrastructure, with a render budget.
It is exactly the client that loses this race. When it loses, Google indexes **the
category dashboard under the tool's URL** — 55 identical pages for `/devtools/*`,
with an identical `<title>`.

That is duplicate content at scale and a direct cause of the 48 "Crawled – currently
not indexed".

**Related:** the widget's `<Head>` overrides the per-tool `<title>` with the category
title whenever the bridge fails.

---

### 🟠 P1-5 — `www.toolsrift.com` serves 200, not 301

```
GET https://www.toolsrift.com/               → 200 OK   (should be 301)
GET https://www.toolsrift.com/devtools/cidr-calc → 200 OK
```

The canonical tag correctly points to the non-www host, so you are not being indexed
twice — but Google has spent **492 crawl requests (17 % of your total budget)** on a
mirror. On a site with 296 pages waiting to be discovered, that is 17 % of your scarcest
resource thrown away.

---

### 🟠 P1-6 — Thin server-rendered content

| Page | Server-rendered words |
|---|---|
| `/devtools/cidr-calc` | 262 |
| `/financecalc/investment-return-calc` | 295 |

Pages competing for "cidr calculator" and "investment return calculator" routinely carry
800–2,000 words plus worked examples, reference tables, and formula explanations. 262
words of boilerplate ("runs entirely in your browser — nothing to install") is a thin
page, and it reads as templated because it *is* templated.

**Your metadata, by contrast, is genuinely good** — do not spend time here:

```
titles     1,136 / 1,136 (100 %)   avg 53.9 chars   0 duplicates
meta desc  1,109 / 1,136 (97.6 %)  avg 137.1 chars
FAQ        1,136 / 1,136 (100 %)   avg 3.0 Q&A
howTo        518 / 1,136 (45.6 %)  ← the one real gap
```

Only `business` is missing descriptions (27 of 41 tools).

---

### 🟡 P2-7 — Smaller items

- **`Disallow: /checker` in robots.txt** — but `/checker` has 53 impressions at position
  41.9. Google is indexing it without being able to read it. Either allow it or add a
  proper `noindex` meta tag (robots.txt disallow does *not* remove a page from the index).
- **Duplicate JSON-LD.** After hydration each tool page emits two `WebApplication`/
  `SoftwareApplication` blocks, two `BreadcrumbList` blocks, and two `FAQPage` blocks —
  one from `[tool].js` with the clean URL, one from `ToolPageLayout.jsx:16` with a
  `#/tool/` hash URL. Conflicting entity URLs for the same page.
- **FAQPage schema earns you nothing.** Google removed FAQ rich results for
  non-authoritative sites in 2023. Your "Search appearance" report confirms it: 1 total
  impression, from Product snippets. Keep the FAQ content for users, but do not expect CTR from the markup.
- **7 × 404** — pull the exact URLs from GSC → Pages → Not found and either restore or
  remove them from the sitemap.
- **Response time rising** — 263 ms → 582 ms over the last two weeks. Google throttles
  crawl rate when response time climbs. Watch this.

---

## 4. The math to 500 clicks

Current run rate (last 7 days extrapolated): **~64 clicks/month, ~20,500 impressions/month.**

500 clicks requires the product of two independent levers:

```
clicks  =  impressions  ×  CTR

500     =    70,000     ×  0.71 %
500     =    90,000     ×  0.56 %
500     =   120,000     ×  0.42 %
```

You currently sit at 20,500 impressions and 0.31 % CTR. So you need roughly
**3.5× the impressions and 2× the CTR simultaneously.**

**Is that achievable?** The impressions half, yes — 296 unindexed pages plus real
internal linking plus the current doubling trend gets you to 70–90 k. The CTR half means
moving your average position from 72 to roughly **35–40**, with a tail of 150–250
long-tail queries actually landing in the top 10.

**Honest forecast:**

| Scenario | August clicks |
|---|---|
| Do nothing (momentum only) | 80 – 120 |
| P0 fixes shipped in week 1 | 250 – 400 |
| P0 + P1 + content + off-site | **450 – 700** |

500 is a stretch target that is *reachable*, but only if the P0 work ships in the first
7 days. Every week of delay costs roughly 100 clicks, because Google needs 2–3 weeks to
re-crawl, re-render, and re-rank after the structure changes. **Shipping on Aug 3 and
shipping on Aug 17 are not the same month.**

---

## 5. The plan

### Week 1 (Aug 1 – 7) — P0. ✅ SHIPPED 2026-08-01

All seven items below are implemented and verified against a production build.
Measured before → after, in the server-rendered HTML Google receives:

| Page | Crawlable tool links before | After |
|---|---|---|
| `/` (home) | 0 categories linked beyond 4 | 29 categories + `/tools` |
| `/tools` | 0 (46 words total) | **1,136** (3,437 words) |
| `/devtools` | 0 | 55 |
| every tool page (×1,136) | 6 (all `display:none`) | 12 visible + 29 category links |
| `display:none` blocks per tool page | 1 (the entire article) | **0** |

Verified in a production run: cold loads of `/devtools/cidr-calc`,
`/business/roi-calculator`, `/financecalc/investment-return-calc` and others now
render the **tool** with its own `<title>` — never the category dashboard —
`location.hash` stays empty, and each page has exactly one `<h1>`, one FAQ
section, one footer, and one each of `SoftwareApplication` / `BreadcrumbList` /
`FAQPage` JSON-LD. In-app navigation from a category page is still instant.



**1. Make every tool tile a real `<a href>`.**
`components/shared/ToolCard.jsx`, `components/shared/CategoryDashboard.jsx`,
`components/shared/ToolNavSidebar.jsx`.

Replace `<motion.div role="button" onClick>` with `<motion.a href="/{category}/{tool.id}">`
using Next's `<Link>`. Keep the `onClick` for instant client-side navigation, but call
`e.preventDefault()` inside it so the `href` is still there for Googlebot.

> This one change converts 1,136 orphans into linked pages. It is the highest-ROI
> line of code in the repository.

**2. Kill every `#/tool/` href.**
72 occurrences across 36 files. Every `href={`${theme.pageRoute}#/tool/${id}`}` becomes
`href={`/${categorySlug}/${id}`}`. Hash routing can stay as the *internal* mechanism;
it must never appear in an `href`.

**3. Stop hiding the SEO block.**
`pages/[category]/[tool].js:280`. Do not use `display:none`. Either:
- render the widget and the SEO prose as *one* page (preferred — no duplication, no hiding), or
- keep the fallback visible below the tool as the page's article section.

**4. Fix the hash bridge race — or remove it.**
The 1,200 ms `requestAnimationFrame` guard at `pages/[category]/[tool].js:167-204` is
the wrong shape for a crawler. Pass the tool id to the widget as a **prop** instead of
through `window.location.hash`. No race, no timing window, deterministic render.
While you are there, stop the widget's `<Head>` from overriding the per-tool `<title>`.

**5. Rebuild `/tools` as a real server-rendered index.**
It currently ships 46 words and zero links. It should be a static list of all 1,136 tool
URLs grouped by category — a single crawlable hub, linked from the homepage and footer.

**6. 301 `www` → apex.** Add to `vercel.json` (or `middleware.js`). Recovers 17 % of crawl budget.

**7. Ship, then push.** `node scripts/generate-sitemap.js` → deploy →
`node scripts/submit-indexnow.js` → `node scripts/submit-google-sitemap.js`.
Then manually request indexing in GSC for the 20 highest-value URLs in §6.

---

### Week 2 (Aug 8 – 14) — P1. ✅ Content gaps closed 2026-08-01

The full-site content audit (see prompt history) found: 618 tools (54.4%) had no
`howTo` and fell back to identical boilerplate ("Open the tool above... Enter
your input... Get your result") on every one of those pages; 134 tools across
3 categories (`devgen`, `generators`, `generators2`) shared one **byte-identical**
FAQ block verbatim; 27 `business` tools had no meta description at all.

All three are now fixed, verified end-to-end in the built HTML:

| Metric | Before | After |
|---|---|---|
| Tools missing `howTo` | 618 (54.4%) | **0** |
| Tools missing meta description | 27 | **0** |
| Duplicate (byte-identical) FAQ groups | 3 groups / 134 tools | **0** |

Every `howTo` was written per-tool, grounded in that tool's own (already
accurate, already-unique) description — not templated. `scripts/extract-seo.js`
was extended to support two new authoring patterns so this scales:
a `HOWTO` lookup object + `mergeHowTo()` helper for hand-written `TOOL_META`
literals, and a `HOWTO[t.id]` reference inline for computed
(`TOOLS.reduce`/`.map`) ones. Confirmed live: `/business/invoice-gen` (the
page originally caught rendering the fallback) now serves its own real
how-to; zero pages sitewide still contain the fallback string.

Item #9 (missing `howTo` coverage) from the original P1 list is therefore
done in full, not just "top 100 by impressions." Remaining Week 2 items:



**8. Deepen the top 40 pages by impressions.** Not all 1,136 — the 40 that already have
demand. Target 800–1,200 words of *genuinely useful* content each: worked examples,
reference tables, the formula, common mistakes, unit definitions. Start with:

| Page | Impr | Pos |
|---|---|---|
| `/financecalc/investment-return-calc` | 734 | 88.3 |
| `/devtools/cidr-calc` | 328 | 79.0 |
| `/business/roi-calculator` | 197 | 79.9 |
| `/converters2/paper-size-converter` | 189 | 70.5 |
| `/units/data-rate-converter` | 170 | 55.1 |
| `/converters2/blood-glucose-converter` | 168 | 71.4 |
| `/text/number-to-words` | 150 | 79.7 |
| `/text/reading-time` | 123 | 73.5 |
| `/study/scientific-notation-converter` | 122 | 46.1 |
| `/random/random-word-generator` | 104 | 81.6 |

**9. Fill the 27 missing `business` meta descriptions** and raise `howTo` coverage from
45.6 % toward 100 % — at minimum for the top 100 pages by impressions.

**10. Deduplicate JSON-LD.** One `SoftwareApplication`, one `BreadcrumbList`, one
`FAQPage` per page, all using the canonical URL. Remove the hash-URL variants from
`ToolPageLayout.jsx`.

**11. Fix the 7 × 404** and resolve `/checker` (allow + `noindex`, or allow and let it rank —
it is at position 41.9 with 53 impressions, so it has demand).

**12. Response time.** Investigate the 263 → 582 ms climb. `bom1` is your only region;
93 % of your impressions are outside India. Consider adding `iad1` or moving to a
multi-region edge deploy.

---

### Weeks 3–4 (Aug 15 – 31) — P2. Authority and the tail.

**13. Off-site signals.** A domain with zero backlinks caps out around position 40 no
matter how good the page is. Highest value per hour, in order:
- Submit the site to tool directories (AlternativeTo, Product Hunt, SaaSHub, Slant, ToolFinder).
- Answer 20–30 Reddit / Stack Overflow / Quora questions where a specific ToolsRift
  tool is the literal answer. Link the *tool page*, never the homepage.
- Publish 3–4 genuinely useful reference articles that link internally to 15–20 tools each
  (e.g. "CIDR notation explained with a full subnet table", "How CAGR is actually calculated").

**14. Work the striking-distance list** (§6). These are pages already inside the top 20 —
each needs one push, not a rebuild.

**15. Bing / IndexNow.** Your IndexNow pipeline already covers Bing, Yandex, Seznam,
Naver and Yep. Bing indexes new sites far faster than Google and its traffic is
disproportionately desktop-with-intent. It will not show in GSC, but it is real traffic
while Google's trust ramp runs.

---

## 6. Target list

### A. Striking distance — already top 20, one push from page 1

| Page | Impr | Pos | Query |
|---|---|---|---|
| `/study/exam-countdown` | 29 | 19.0 | exam countdown |
| `/html/html-tag-counter` | 23 | 18.2 | tag counter (16 impr, pos 17.9) |
| `/fancy/clap-text` | 13 | 12.9 | clap text generator |
| `/everyday/next-friday-13` | 10 | 14.5 | next friday 13 |
| `/html/html-select-generator` | 5 | 17.6 | — |
| `/hash/djb2-hash` | 5 | 18.4 | djb2 hash online (pos 5.0) |
| `/study/unit-prefix-reference` | 4 | 17.5 | — |
| `/js/es6-to-es5` | 32 | 25.1 | es6 to es5 converter online (pos 7.0) |

### B. Best impression-to-position ratio — the real money

| Page | Impr | Pos | Why |
|---|---|---|---|
| `/units/data-rate-converter` | 170 | 55.1 | "gb to mbps", "mbps to bitrate" (pos 35.7) |
| `/study/scientific-notation-converter` | 122 | 46.1 | high volume, mid position |
| `/generators/serial-number-gen` | 54 | 58.9 | "serial number generator" pos 52 |
| `/checker` | 53 | 41.9 | "toolchecker" 21 impr, "tool checker" 19 impr pos 32.6 — **and it is robots-blocked** |
| `/formatters/line-counter` | 47 | 51.4 | "line counter" pos 55.4 |
| `/pdf/pdf-margin-adder` | 42 | 46.6 | — |
| `/everyday/add-subtract-days` | 36 | 33.5 | "90 days before 10/6/2026" pos 8.3 |
| `/devtools/semver-tools` | 24 | 52.7 | "semver validator" pos 47.9 |
| `/css/css-flexbox` | 26 | 56.5 | "css flexbox generator online" 23 impr pos 58 |

### C. Highest-demand keyword clusters (deepen these first)

| Cluster | Queries | Impr | Avg pos | Primary page |
|---|---|---|---|---|
| ROI / investment return | 81 | 738 | 87.2 | `/financecalc/investment-return-calc` |
| CIDR / subnet | 43 | 287 | 78.7 | `/devtools/cidr-calc` |
| Encode / decode | 87 | 327 | 75.7 | `/encoders/*` |
| SWOT / business docs | 25 | 184 | 79.7 | `/business/swot-gen` |
| Video tools | 37 | 166 | 74.6 | `/video/*` (already earning 2 clicks) |
| CSS generators | 36 | 149 | 76.6 | `/css/*` |
| Random generators | 44 | 141 | 74.5 | `/random/*` (already earning 4 clicks) |
| Blood glucose | 29 | 103 | 70.0 | `/converters2/blood-glucose-converter` |

**Note on the ROI cluster:** 738 impressions at average position 87 is your single
largest pocket of unmet demand. `/financecalc/investment-return-calc` alone has 734
impressions and zero clicks. This page deserves a full rewrite — proper CAGR/XIRR/
absolute-return explanation, a worked example, a year-by-year table, and the formula
rendered as text. It is the best single-page opportunity on the site.

---

## 7. Measurement

Track weekly, not daily. Expect **no movement for 10–14 days** after the P0 ship —
Google must re-crawl, re-render, and re-rank.

| Metric | Now | Aug 14 target | Aug 31 target |
|---|---|---|---|
| Indexed pages | 831 | 1,000 | 1,120+ |
| Discovered – not indexed | 296 | < 120 | < 40 |
| Impressions / month | ~20,500 | 45,000 | 80,000 |
| Average position | 71.7 | 55 | 40 |
| CTR | 0.31 % | 0.45 % | 0.65 % |
| **Clicks / month** | **~64** | **~180** | **500** |
| Crawl: JS share | 46.65 % | < 35 % | < 30 % |
| Crawl: www requests | 492 | 0 | 0 |
| Avg response time | 582 ms | < 350 ms | < 300 ms |

**The leading indicator to watch is "Discovered – currently not indexed."** If that
number does not start falling within 10 days of the internal-linking fix, the fix did
not work — re-verify with GSC's URL Inspection → "Test live URL" → *View crawled page*,
and confirm you can see `<a href="/devtools/cidr-calc">` in the rendered HTML.

---

## 8. If you only do three things

1. **Turn tool tiles into `<a href>` links** (`ToolCard.jsx`, `CategoryDashboard.jsx`,
   `ToolNavSidebar.jsx`) and rebuild `/tools` as a crawlable index.
2. **Remove the hash bridge race and stop hiding the SEO block** in
   `pages/[category]/[tool].js` — so Google reliably renders the tool, not the category dashboard.
3. **Rewrite the top 20 pages by impressions** to 800–1,200 words of real reference content.

Items 1 and 2 are one focused day of work and they unblock everything else.

---

## Sources

- [How To Fix "Discovered – Currently Not Indexed" in GSC — Onely](https://www.onely.com/blog/how-to-fix-discovered-currently-not-indexed-in-google-search-console/)
- [Discovered, currently not indexed — Ahrefs](https://ahrefs.com/blog/discovered-currently-not-indexed/)
- [How to Fix 'Discovered – Currently Not Indexed' — Prerender.io](https://prerender.io/blog/how-to-avoid-discovered-currently-not-indexed/)
- [The Free Tools SEO Strategy — Ahrefs](https://ahrefs.com/blog/the-free-tools-seo-strategy/)
- [Why Google Isn't Indexing Pages Anymore: 2026 Survival Guide](https://aivisibility.systeme.io/google-indexing-survival-guide-2026)
