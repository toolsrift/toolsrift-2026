# ToolsRift — Social Automation Plan

> **Status:** Planning. Nothing implemented yet.
> **Goal:** Publish a short explainer video for each of the 957 tools to the ToolsRift
> Facebook Page and Instagram account, automatically, at a sustainable cadence.
> **Later:** LinkedIn, once Meta is stable.

---

## 1. Decisions already made

| Decision | Choice | Why |
|---|---|---|
| Integration | **Build in-house against the Meta Graph API** | Free, no third-party dependency, full control. Fall back to a paid scheduler (Zernio/Ayrshare) only if Meta App Review becomes a wall. |
| Creative | **HyperFrames explainer video: motion graphic + real screenshots** | Shows the actual product, works for all 957 tools with no flaky interaction automation. |
| Cadence | **2 posts/day, highest-value tools first** | ~16 months of content. Safe for the algorithm; these posts have no expiry date. |

---

## 2. What we're working with

### Content source (already exists — no hand-authoring needed)

| File | Covers | Fields |
|---|---|---|
| `lib/toolRegistry.js` | **957 / 957** tools, 24 categories | `id`, `name`, `desc` |
| `lib/toolSeo.js` | varies | `title` (938), `faq` (938), `desc` (911), `howTo` (**339**), `keywords` (290) |
| `lib/categoryThemes.js` | 24 / 24 categories | color, font stack, **animation feel** |
| `lib/toolIcons.js` | icon overrides | per-tool emoji |

Every tool already has a live, indexable URL at `/{category}/{tool}`.

### The `categoryThemes` animation feels — this is the key asset

`categoryThemes.js` assigns each category a signature motion preset: `glitch` (dev, hash),
`liquid` (colors, css), `precise` (calculators, finance), `bouncy` (playful), `smooth` (default).

This matters more than it looks. **957 structurally identical posts is exactly what Meta's
spam heuristics punish.** Driving the HyperFrames motion preset off `categoryThemes` means
a dev-tool Reel and a color-tool Reel look and move genuinely differently — variation for free,
with no per-tool creative work.

### The `howTo` gap — 618 tools missing it

Only **339 of 957** tools have a `howTo` string. `howTo` is the spine of an explainer video
("here are the 3 steps"), so this is a real gap, not a nice-to-have.

Worth fixing regardless: per `CLAUDE.md`, `howTo` is lifted by `scripts/extract-seo.js` into
the **server-rendered SEO** on every tool page. Backfilling it improves organic search *and*
unblocks the video pipeline. Double value — so it's Phase 1 of this plan, not an afterthought.

---

## 3. Hard constraints (researched)

### Instagram

- **Every video post is a Reel.** `media_type=REELS`. There is no "video feed post".
- **Publishing is two-step and asynchronous.** Create a media container → **poll `status_code`
  until `FINISHED`** (can take from ~30s to several minutes for video) → then publish. This is
  the single biggest difference from image posting and the main source of pipeline bugs.
- **Media must be at a publicly reachable URL** at the moment of the publish attempt.
- **Rate limit: 100 API-published posts per rolling 24 hours.** Not our binding constraint —
  our constraint is the algorithm and audience tolerance, which is why we chose 2/day.
- **Captions carry no clickable links.** Instagram will build brand and reach; it will send
  almost no traffic to toolsrift.com. Facebook is the traffic channel. Plan the two differently.
- Permissions (Facebook Login path): `instagram_basic`, `instagram_content_publish`,
  `pages_read_engagement`.
- **Page Publishing Authorization (PPA)** may block publishing until completed.

### Facebook

- Page video posts go to a **different endpoint** than IG (`/{page-id}/videos`). Facebook Reels
  is a *third*, resumable-upload API. We will use plain Page video posts — they accept a link
  in the message body, which is what we actually want.
- Permissions: `pages_manage_posts` + `pages_read_engagement`, using a **Page access token**.
- A Page token derived from a long-lived user token **does not expire**, but *can* be
  invalidated (password change, permission revoke). The pipeline needs a token health check.

### ⚠️ The two things that can kill this — and are unresolved

1. **Access level.** Advanced Access is definitively required to publish to Pages you *don't*
   own. For Pages you *do* own and administer, Standard Access as an app admin is generally
   sufficient — but this is **not confirmed for our setup**, and Business Verification may be
   demanded first.
2. **The exact Reels container/polling contract**, which I have not verified end-to-end.

Both are cheap to test and expensive to discover after building. Hence Phase 0.

### Hosting — 957 MP4s cannot live in the repo

Several GB of video would wreck the git history and blow the Vercel deploy budget.

**But we never need 957 at once.** At 2/day the pipeline only needs ~14 rendered ahead.
So: render a rolling two weeks → upload → post → **delete the asset once the post is confirmed.**
Steady-state storage stays near zero, and we never do a 16-hour mega-render.

#### Host: GitHub Releases (chosen)

`github.com/toolsrift/toolsrift-2026` is a **public** repo, which means release assets are
anonymously downloadable. Upload the MP4 as a release asset from the Action, hand Meta the URL,
delete the asset after the post lands.

| | |
|---|---|
| Cost | **Free** |
| New account / credit card | **None** — GitHub is already in the stack |
| Git history impact | **None** — release assets are not git objects |
| Cleanup | `gh release delete-asset` |

**Unverified:** the asset URL 302-redirects to `objects.githubusercontent.com`, and it is not
confirmed that Meta's media fetcher follows that redirect. **Phase 0 tests this with one file.**

**Fallback if it doesn't: Supabase Storage** — 1 GB free, no credit card, public buckets, direct
URLs with no redirect.

#### Rejected alternatives

- **Cloudflare R2** — requires a credit card on file even for the free tier; some users report a
  $5 charge on activation. Satyam has no Cloudflare account. Not worth the friction.
- **Vercel Blob** — 1 GB free, but the **Hobby plan is explicitly non-commercial**, and ToolsRift
  is ads-monetized. Don't build the pipeline on terms we'd be violating.
  *(Separately worth checking whether toolsrift.com itself is currently on Hobby.)*
- **`public/social/` in the Next.js app** — simplest, but every MP4 enters git history
  permanently. Deleting the file later does not shrink the history. ~1 GB/year of bloat. No.

---

## 4. Architecture

```
docs/
  social-automation-plan.md      ← this file

scripts/social/
  backfill-howto.mjs             # fill the 618 missing howTo strings (also boosts SEO)
  build-queue.mjs                # rank 957 tools by priority → content/social/queue.json
  capture.mjs                    # Playwright → 2-3 real stills per tool
  render.mjs                     # HyperFrames → 1080x1920 MP4, motion preset from categoryThemes
  upload.mjs                     # → Cloudflare R2, returns public URL
  caption.mjs                    # templated captions (rotated) from registry + toolSeo
  post.mjs                       # the daily job: FB Page video + IG Reel
  meta-client.mjs                # Graph API wrapper: async container polling, retries, errors
  r2-client.mjs

compositions/tool-explainer/     # ONE HyperFrames composition, variable-driven
  index.html

content/social/
  queue.json                     # generated: ordered, prioritized
  state.json                     # committed: what posted, when, Meta post IDs, failures

.github/workflows/
  social-render.yml              # weekly: render + upload next 14
  social-post.yml                # 2x daily: post next due item
```

### Why a queue file + a state file

`queue.json` is *what to post and in what order* (regenerable, derived).
`state.json` is *what actually happened* (append-only truth, committed to git).

Keeping them separate means we can re-rank the queue at any time without losing history, and
a failed post is visible and retryable rather than silently skipped.

### Secrets (GitHub Actions)

`META_APP_ID`, `META_APP_SECRET`, `FB_PAGE_ID`, `FB_PAGE_ACCESS_TOKEN`, `IG_USER_ID`.

Media upload uses the Action's built-in `GITHUB_TOKEN` — **no extra secret needed.**

> Satyam sets these in GitHub Actions secrets directly. Claude never sees the token values.

---

## 5. The video

One HyperFrames composition, driven entirely by variables. ~10–15s, vertical 1080×1920,
**silent-first with on-screen text** (how Reels are actually watched), optional light BGM.

| Beat | Content | Source |
|---|---|---|
| Hook | "Need to {benefit}?" | `desc` |
| Title | Tool name + icon | `toolRegistry`, `toolIcons` |
| Steps | 3 steps | `howTo` (← why the backfill is Phase 1) |
| Proof | Real screenshots, animated in a device frame | Playwright capture |
| CTA | `toolsrift.com/{category}/{tool}` | derived |

Motion preset, color and font all come from `categoryThemes[category]`.

**Render cost:** ~30–90s per video locally. At 14/week that's trivial. If a large backfill batch
is ever needed, `hyperframes lambda` does cloud rendering — but the rolling design means we
should never need it.

---

## 6. Phases

### Phase 0 — Access spike *(do this first, no code enters the repo)*

Prove Meta will let us do this **before** building anything.

1. Confirm `instagram.com/toolsrift` is a **Professional (Business/Creator)** account and is
   connected to the `toolsrift.official` Page. *(Check this first — it's the cheapest thing that
   can invalidate everything below.)*
2. Locate the existing Meta app under business `1587340165701284`; add the
   `pages_manage_posts`, `pages_read_engagement`, `instagram_basic`,
   `instagram_content_publish` permissions.
3. **Satyam** generates a long-lived Page access token via the Graph API Explorer and puts it
   straight into GitHub Actions secrets. *(Claude cannot and will not do this step — it needs
   Facebook credentials.)*
4. Upload one throwaway MP4 as a **GitHub release asset**. Confirm it is anonymously fetchable
   and that **Meta follows the `objects.githubusercontent.com` redirect.** If not → Supabase.
5. **By hand (curl):** post that video to the Facebook Page (`/{page-id}/videos`). Then to
   Instagram as a Reel (`media_type=REELS` → poll `status_code` until `FINISHED` →
   `/media_publish`).
6. Record exactly what Meta demanded along the way: App Review? PPA? Anything else?

**Exit criterion:** two test posts visible on the live accounts, published via API.
If this fails, the whole downstream plan changes — which is precisely why it's first.

### Phase 1 — Content backfill
Fill the 618 missing `howTo` strings. Regenerate `lib/toolSeo.js` + sitemap per the mandatory
workflow in `CLAUDE.md`. Ships an SEO win on its own, independent of social.

### Phase 2 — Creative pipeline
Playwright capture → HyperFrames composition → MP4. **Review ~10 sample videos across
different categories before generating at scale.**

### Phase 3 — Poster
`meta-client.mjs` with async polling and real error handling. Queue + state. **Dry-run mode
first** — prints exactly what it *would* post, calls nothing.

### Phase 4 — Automate + ramp
GitHub Actions cron. Start at **1/day for a week**, watch reach and account standing, then go
to 2/day. Do not skip the ramp.

### Phase 5 — LinkedIn
Company page via `/ugcPosts`, `w_organization_social`. Separate app, separate review.

---

## 7. Accounts — confirmed

| | |
|---|---|
| Business Manager | `1587340165701284` — **verified** |
| Facebook Page | [facebook.com/toolsrift.official](https://www.facebook.com/toolsrift.official/) |
| Instagram | [instagram.com/toolsrift](https://www.instagram.com/toolsrift/) |
| Meta Developer App | **Exists** under the business |
| Repo | `toolsrift/toolsrift-2026` — **public** (→ Releases usable as media host) |
| Video host | GitHub Releases; Supabase Storage as fallback |

**Still to confirm in Phase 0:** that the Instagram account is a **Professional
(Business/Creator)** account and is **linked to the Facebook Page**. If it is still a personal
account, no part of this works until it is converted — check this before anything else.

---

## 8. Risks, honestly

| Risk | Severity | Mitigation |
|---|---|---|
| Meta demands full App Review / Business Verification | **High** — could block everything | Phase 0 spike surfaces this in an afternoon |
| Posts read as bot spam → reach collapses, account restricted | **High** | Category-driven motion variety, rotated caption templates, 2/day cadence, slow ramp |
| IG Reels async container flakiness | Medium | Polling with backoff; failures recorded in `state.json` and retried, never silently dropped |
| Page token invalidated | Medium | Health check before each run; fail loudly |
| Instagram sends ~no traffic | **Expected, not a bug** | IG = brand/reach. Facebook = traffic. Measure them differently. |
| 957 videos in git | Avoided by design | Rolling 14-ahead render + R2, prune after post |
