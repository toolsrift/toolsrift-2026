# Search traffic cliff — verification & corrected diagnosis

> **Reviewed:** 2026-08-26
> **Source data:** `toolsrift.com Performance on Search 2026-08-26.xlsx`
> (GSC Web search, last 3 months: 2026-05-24 → 2026-08-23)
> **Purpose:** verify the 2026-08-26 audit against the raw export and the repo,
> correct what does not hold up, and re-tier the site by measured performance.

---

## 1. What the export actually shows

90-day totals: **61 clicks · 21,265 impressions · 0.287 % CTR · avg position 71.4**.

The cliff is real and lands exactly where the audit said:

| Date | Clicks | Impressions |
|---|---|---|
| 12 Aug | 3 | 1,166 |
| 13 Aug | 1 | 1,078 |
| 14 Aug | 3 | 574 |
| 15 Aug | 1 | 508 |
| **16 Aug** | **1** | **7** |
| 17–23 Aug | 0–1 | 1–6 |

−98.6 % in one day, flat since. Confirmed.

**The detail that identifies the mechanism:** average position on the surviving
impressions stays at 45–74 — the same band as before. Nothing got gradually worse.
A large set of URLs left the reportable results entirely while the rest held station.
GSC only records an impression inside roughly the top 100, so this is the signature of
"most URLs fell past ~100", not "everything slid down a bit".

Supporting evidence for how marginal those impressions always were:

- **Desktop:** 19,447 impressions → 27 clicks (**0.14 %** CTR)
- **Mobile:** 1,721 impressions → 29 clicks (**1.69 %** CTR)

91 % of all impressions were desktop, converting at one twelfth the mobile rate.
That is a site living in the tail of deep desktop SERPs, not a site with demand.

Query position distribution (top 1,000 queries): **936 sit at position 51–100.**
Only 10 rank in the top 20.

---

## 2. Audit claims that hold up

| Claim | Verdict |
|---|---|
| Cliff on 16 Aug, ~99 %, flat since | **Confirmed** from the daily series |
| 90-day totals ≈ 21.3k impressions / 61 clicks / ~0.3 % CTR / pos ~71 | **Confirmed** (21,265 / 61 / 0.287 % / 71.4) |
| Aug 2026 spam update ran 18–21 Aug, so it post-dates the drop | **Confirmed** — Google announced it 18 Aug ~12:30 ET, complete 21 Aug ~04:50 ET |
| Last commit was 1 Aug | **Confirmed** (`775e364`, 2026-08-01) |
| Recovery is not the goal — peak was worthless | **Confirmed and understated.** Full recovery to 13 Aug = ~1 click/day |
| Video is the wedge | **Confirmed and badly understated** — see §4 |

---

## 3. Audit claims that do not hold up

### 3.1 "Finish killing the duplicate FAQs" — already done, zero work remaining

Measured across all 1,136 tools in `lib/toolSeo.js`:

- duplicate FAQ blocks: **0 groups**
- duplicate meta descriptions: **0 groups**
- tools missing `howTo`: **0**
- duplicate `howTo` strings: **1 group, covering 2 tools**

The 134-way duplication was fully eliminated by `bdba0c6` on 1 Aug. Near-duplicate
check (4-gram Jaccard over FAQ answers, 811 sampled same-category pairs) gives a mean
similarity of **0.086** — the content is genuinely per-tool, not templated.

### 3.2 "~200–250 words of template" — wrong in both directions

Server-rendered unique text per tool page (`howTo` + FAQ + description):

- **median 120 words**, mean 128, min 68, max 255
- 549 of 1,136 tools sit under 120 words

So it is **thinner** than reported (~120, not 200–250) but it is **not template** —
it is unique, specific and factually correct. The real problem is volume, not sameness.
That changes the remedy: nothing to de-duplicate, everything to deepen.

### 3.3 "Most of your 1,136 pages have never received a single impression" — overstated

- Tool URLs with ≥1 impression in 90 days: **724 (64 %)**
- Tool URLs with **zero**: **412 (36 %)**

Not "most". A mechanical "noindex everything with 0 impressions" pass therefore
touches about a third of the site and removes pages Google was already ignoring —
low cost, but also low return. It is not the lever it was presented as.

### 3.4 The H1 finding — the real defect is different, and worse

`pages/[category]/[tool].js` renders `How to use {tool.name}` as an **`<h2>`**, not an
`<h1>`. The actual problem is upstream: the tool widget is loaded with
`dynamic(..., { ssr: false })`, so the server HTML for **all 1,136 tool pages contains
no `<h1>` at all** — only a loading spinner, then the article's `<h2>`s. The H1 exists
only after the client bundle downloads and mounts.

Every tool page ships an H1-less document to first render. That is worth fixing, and it
is a different fix from the one proposed.

### 3.5 "Nothing shipped near the 16th, so the deployment isn't implicated" — this is the weak link

The inference does not follow. On **1 Aug** three commits changed every URL on the site
at once:

- `8f056f7` "Make all 1,136 tool URLs crawlable and deterministically routed"
- `bdba0c6` "Write real per-tool content for all 618 tools missing howTo…"
- `be9bf89` sitemap bumped — **all 1,175 URLs carry `<lastmod>2026-08-01</lastmod>`**

A sitewide change does not produce its ranking effect on the deploy date. It produces it
when Google finishes recrawling and re-scoring, which for a site this size is one to
three weeks. The 12–13 Aug impression spike (1,166 / 1,078, the two highest days on
record) followed by collapse on the 16th is consistent with exactly that: a recrawl
surge, then the re-evaluation landing.

**The 1 Aug release is the leading suspect, not an exonerated one.**

Note also the routing history recorded in `lib/appRoute.js`: before 1 Aug, Googlebot
frequently lost the hash-bridge race and indexed tool URLs **showing the category
dashboard, under the category's `<title>`** — dozens of identical pages per category.
So Google's pre-16-Aug index of this site was substantially wrong, and 1 Aug corrected
it. Some of the "lost" impressions were being earned by pages that were not what they
appeared to be.

---

## 4. What the data says to actually do

### The wedge is video, by a wide margin

Impressions per **live** URL, tool URLs only:

| Category | Live URLs | Impressions | Impr/URL | Clicks | Clicks/1k impr |
|---|---|---|---|---|---|
| **video** | 14 | 1,928 | **137.7** | 19 | 9.85 |
| encoding | 21 | 712 | 33.9 | 2 | 2.81 |
| random | 29 | 797 | 27.5 | 10 | 12.55 |
| mathcalc | 38 | 949 | 25.0 | 2 | 2.11 |
| generators | 33 | 760 | 23.0 | 4 | 5.26 |
| financecalc | 44 | 1,884 | 42.8 | **0** | 0.00 |

Video earns **5–7× the impressions per URL of any other category** off 14 live pages,
and takes 31 % of all site clicks. `random` is the second-best converter. `financecalc`
has 44 live URLs, 1,884 impressions and **zero clicks in 90 days** — it is the clearest
example of scale bought at zero return.

### Tiering

`docs/seo-page-tiers-2026-08-26.csv` classifies every one of the 1,136 tool URLs by
measured 90-day performance:

| Tier | Rule | URLs |
|---|---|---|
| **INVEST** | ≥1 click or ≥100 impressions | 67 |
| **KEEP** | 20–99 impressions | 127 |
| **WATCH** | 1–19 impressions | 530 |
| **PRUNE** | 0 impressions | 412 |

Recommended order of work:

1. **Stop publishing new tools.** Unchanged from the original audit, and correct.
2. **Go deep on the 14 video URLs first**, then the rest of INVEST. Target 1,000+ words
   of genuinely useful content per page — worked examples, format/codec tables, limits,
   failure cases. This is where the only real demand signal exists.
3. **Fix the missing server-side `<h1>`** across all tool pages (§3.4). Cheap, sitewide.
4. **Noindex the 412 PRUNE URLs**, and reconsider `financecalc` wholesale.
5. **Skip the duplicate-FAQ work entirely** — it is finished (§3.1).
6. **Vary `<lastmod>`.** 1,175 URLs sharing one date tells Google the whole site was
   machine-generated on 1 Aug. Set it per-page from real content-change dates.
7. **Get links.** At position 51–100 across 936 of 1,000 queries, no on-page work moves
   the needle. This remains the binding constraint.

---

## 5. What cannot be determined from this export

- The Pages and Queries sheets are **90-day aggregates with no date dimension**, so the
  drop cannot be attributed to specific URLs or queries from this file. Pulling a
  1–15 Aug vs 16–26 Aug comparison in GSC would settle whether the loss is uniform
  (site-level action) or concentrated (page/template-level).
- The live site is unreachable from this environment (egress-blocked), so the deployed
  HTML could not be inspected; §3.4 is verified against the repo at HEAD, which may be
  ahead of what is deployed.
- Distinguishing "demoted past position 100" from "Google returned fewer deep results"
  is not possible from impressions alone. Both fit the data. Both lead to the same
  conclusion: **traffic that lived at position 71 was never an asset, and rebuilding it
  is not the goal.**
