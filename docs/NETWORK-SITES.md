# ToolsRift Network — 29 standalone category websites (+ Android apps)

> One codebase. Thirty build targets. Every category of ToolsRift becomes its
> own website with its own subdomain, logo, colours, typography, design concept,
> sitemap, PWA manifest and Android app — without copying a single tool.

| | |
|---|---|
| Hub | `toolsrift.com` — everything, unchanged (`NEXT_PUBLIC_SITE_ID` unset) |
| Network site | `<category>.toolsrift.com` — one category at the root (`NEXT_PUBLIC_SITE_ID=<id>`) |
| Registry | `lib/sites/brands.js` — the single source of truth for all 29 brands |
| List them | `npm run sites:list` |
| Validate | `npm run sites:check` |

## 1. Why one codebase and not 29 repositories

The 1,136 tools live in 29 large category components (`components/toolsrift-*.jsx`)
that share the same layouts (`components/shared/*`). Copying that into 29
repositories would mean fixing every bug 29 times and would fork the tool code
within a week.

Instead, the site identity is a **build-time switch**. Next.js inlines
`NEXT_PUBLIC_SITE_ID` into every bundle (pages, API routes and the edge
middleware), so a build with `NEXT_PUBLIC_SITE_ID=pdf` only knows about
`pdf.toolsrift.com`. (On Vercel the id is also derived from the project name
`toolsrift-<id>` when the variable is unset — see `next.config.js`.) Each site is still a *separate Vercel project*, with its own
domain, analytics, Search Console property, AdSense site and Play Store app —
they are separate products for users and for Google. They just share a Git repo.

```
                 lib/sites/brands.js  (29 brands: domain, palette, fonts, concept, logo, android)
                          │
   NEXT_PUBLIC_SITE_ID ───┤ resolved once in lib/sites/index.js → SITE
                          │
   ┌──────────────────────┼───────────────────────────────────────────────┐
   │ lib/designTokens.js  │ COLORS / RADIUS take the brand palette & shape │
   │ lib/categoryThemes.js│ own category → pageRoute "/", brand fonts      │
   │                      │ siblings     → their domain (if live) or hub   │
   │ components/shared/*  │ header logo, banner headline, backdrop, footer │
   │ pages/index.js       │ hub home  OR  StandaloneHome (the category)    │
   │ pages/[slug].js      │ /<tool-id>  (standalone tool pages)            │
   │ pages/[slug]/[tool]  │ /<category>/<tool>  (hub only; 0 paths on site)│
   │ middleware.js        │ 301 other categories → hub, /pdf/x → /x        │
   │ pages/api/site/*     │ robots.txt, sitemap.xml, manifest, assetlinks  │
   │ pages/_document.js   │ icons, theme-color, OG image, fonts, schema    │
   └──────────────────────────────────────────────────────────────────────┘
```

## 2. What a network site looks like

Example: `NEXT_PUBLIC_SITE_ID=pdf`

| URL on pdf.toolsrift.com | Serves |
|---|---|
| `/` | The PDF category app (branded header, "Paper & Ink" banner, tool dashboard) + the category article + network footer |
| `/merge-pdf` | The tool, opened directly, with server-rendered how-to / FAQ / related tools. Canonical = `https://pdf.toolsrift.com/merge-pdf` |
| `/pdf`, `/pdf/merge-pdf` | 301 → `/`, `/merge-pdf` |
| `/text`, `/json/...`, `/tools` | 301 → `https://toolsrift.com/…` (never a duplicate) |
| `/about`, `/privacy-policy`, `/terms`, `/cookies`, `/disclaimer`, `/contact` | Served here (Play Store needs a privacy policy URL on the app's own domain) |
| `/robots.txt`, `/sitemap.xml` | Generated per site from the tool registry |
| `/manifest.json` | PWA manifest with the site's name, colours, icons, shortcuts |
| `/.well-known/assetlinks.json` | Android app verification (package id + signing fingerprint) |

Design differences per site come from `brands.js`:

- **Palette** — base hue (`bg`, `surface…`), `primary`, `accent2`. Applied to
  every shared layout through `COLORS` and to the category theme.
- **Typography** — a Google Fonts pairing per site (`fonts.head/body/mono`),
  loaded in `_document.js` and used by the shared layouts via `theme.fonts`.
- **Shape** — `shape.radius` drives the `RADIUS` scale (sharp 4px for
  developer sites, pill-round 20px for Fancy/Random).
- **Pattern** — `<BrandBackdrop />` paints a fixed texture (ruled paper,
  blueprint grid, waveform, film sprockets, scanlines, confetti, hex…).
- **Concept** — `concept.headline / sub` replace the banner copy.
- **Logo** — mark (tile / squircle / circle / hex) + glyph
  (`scripts/brand-glyphs.js`) + wordmark, generated into `public/brands/<id>/`.

The tool bodies themselves (the 3,000-line category components) are untouched:
they were built on neutral dark surfaces, which is why every palette is a dark
family with its own hue rather than a light theme.

## 3. Daily workflow

```bash
npm run dev:site -- pdf          # http://localhost:3000 is pdf.toolsrift.com
npm run build:site -- image      # production build of image.toolsrift.com
npm run start:site -- image      # serve it
npm run dev                      # the hub, exactly as before
```

Changing a brand (`lib/sites/brands.js`) → `npm run brands:assets` (regenerates
logos/icons/OG PNGs with headless Chromium) → `npm run android:generate` →
`npm run sites:check` → commit `public/brands/` and `android/apps/` with it.

Adding a tool follows the existing mandatory workflow in CLAUDE.md
(`extract-tools.py`, `extract-seo.js`, `generate-sitemap.js`); the standalone
sitemaps are generated at request time from the same registry, so they pick the
tool up automatically on the next deploy.

## 4. Going live — per site checklist

1. **Domain**: every site is a subdomain of toolsrift.com (`pdf.toolsrift.com`,
   see `npm run sites:list`). The apex is on Vercel DNS with a wildcard, so the
   subdomain already resolves — nothing to register. (A site can move to its
   own apex domain later by changing `domain` in `brands.js`.)
2. **Create the Vercel project** — easiest: add a `VERCEL_TOKEN` repository
   secret on GitHub once, then run the **vercel-bootstrap** workflow (Actions →
   "Run workflow"). It uses `scripts/vercel/bootstrap-api.js` (Vercel REST API)
   to create `toolsrift-<id>` linked to this repo, set `NEXT_PUBLIC_SITE_ID`,
   attach the subdomain (moving it off the hub project if needed) and trigger
   the first production deploy. Locally the same script runs with
   `VERCEL_TOKEN=… node scripts/vercel/bootstrap-api.js --all`, and
   `npm run vercel:bootstrap -- pdf` is the CLI-based alternative.
   **Vercel limit:** one Git repository can be connected to at most 25
   projects. The hub + 24 sites use that allowance; the remaining sites
   (`audio`, `office`, `data`, `study`, `video`) are created *without* a Git
   link and are deployed by `.github/workflows/vercel-deploy-unlinked.yml`
   (Vercel CLI, `VERCEL_TOKEN` secret) on every push to `main` — same result,
   one extra CI job.
3. **Attach the subdomain to the project** (Vercel → project → Settings →
   Domains → add `pdf.toolsrift.com`). A domain can live on only ONE project:
   `pdf.`, `text.`, `image.`, `dev.` and `calc.toolsrift.com` were mirrors on
   the hub project, so remove one from the hub first, then add it to its own
   project. With Vercel DNS the record is created automatically.
4. **Env vars** on that project (Vercel → Settings → Environment Variables):
   - `NEXT_PUBLIC_SITE_ID` — set by bootstrap.
   - `ANDROID_SHA256_FINGERPRINTS` — optional; the app signing fingerprints
     normally live in `android/fingerprints.json` (committed, served on every
     site), this env var only adds to them.
   - `GOOGLE_SERVICE_ACCOUNT_KEY`, `CRON_SECRET` — optional, same as the hub;
     the daily cron resubmits *this* site's sitemap to the `sc-domain:toolsrift.com`
     property (which covers subdomains).
5. **Flip `live: true`** for the brand in `brands.js`, run
   `node scripts/generate-sitemap.js`, and push. From then on the hub 301s
   `/pdf` and `/pdf/<tool>` to the new site (one canonical copy of every
   tool), every other site links to the new domain, the hub's `sitemap.xml`
   (a sitemap index) lists `https://<domain>/sitemap.xml`, and the hub's own
   pages move to `sitemap-hub.xml`.
6. **Search Console**: the `sc-domain:toolsrift.com` property already covers
   every subdomain, and the hub's sitemap index references every live site's
   sitemap, so nothing needs submitting per site (submitting
   `https://<domain>/sitemap.xml` there anyway speeds discovery up). Each site's
   daily cron pushes its own URLs to IndexNow; only the hub needs
   `GOOGLE_SERVICE_ACCOUNT_KEY`, and it submits the index to the root property.
   Indexation follows the hub's allowlist (`lib/coreTools.js`): non-core tool
   pages are served with `noindex` and left out of every sitemap.
   **AdSense**: subdomains are covered by the approved root site (ads.txt is
   served from `public/ads.txt` on every host). **IndexNow**: the key file
   `public/509a…txt` is served on every domain, so
   `node scripts/submit-indexnow.js` works unchanged once `HOST` is that site
   (it reads the sitemap; run it from a checkout with `NEXT_PUBLIC_SITE_ID` set).
7. **Android**: run the `android-build` GitHub workflow (Actions → android-build →
   Run workflow, `--all` or site ids); it builds and signs every app with
   Bubblewrap and publishes the `.aab`/`.apk` artifacts. `android-listing`
   takes the Play screenshots from the live site; the feature graphic is
   `android/apps/<id>/feature-graphic.png`. Full guide, signing key, Play
   Console steps: `android/README.md`.

### Vercel Hobby quotas (until the team is on Pro)

- 100 deployments per **rolling** 24 h across the team and one build at a
  time. Every push to `main` is up to 30 deployments (25 git-linked projects +
  5 via `vercel-deploy-unlinked`), so a PR push used to add another 25 preview
  deployments for nothing: `vercel.json` → `git.deploymentEnabled` turns
  previews off for the working branch (CI builds the sites on GitHub instead).
- Refused deployments are picked up by the daily catch-up (17:00 UTC), or run
  it by hand: Actions → vercel-deploy-unlinked → Run workflow → `--catch-up`.
- Hobby also forbids commercial (ad-monetised) use; upgrade to Pro before launch.

## 5. Adding a 30th site

1. Add the category component + registry entry as usual (CLAUDE.md).
2. Add a theme entry in `lib/categoryThemes.js` and a brand in
   `lib/sites/brands.js` (same `id`, registry `slug`, unique domain and
   package id, ≤30-char app name, ≤80-char short description).
3. Add a glyph in `scripts/brand-glyphs.js`, then
   `npm run brands:assets && npm run android:generate && npm run sites:check`.
4. Register the slug in `lib/sites/categoryComponents.js`,
   `pages/[slug]/[tool].js` and both extract scripts.

## 6. SEO notes

- Every network site is a **new host**: Google treats a subdomain largely as
  its own site, so expect a ramp-up, though the brand and the root property's
  history help. The hub
  keeps its internal links internal (it never sends its own equity to the
  network from category tiles); cross-links come from the network footer,
  the "More from the ToolsRift network" grid and `isPartOf` /
  `parentOrganization` schema, which tie the sites into one entity.
- Standalone sites index **all** their tools (25–66 pages each) — the thin-
  content prune on the hub (`lib/coreTools.js`) was about 1,136 near-identical
  pages on one domain. If a site gets a "scaled content" signal, the fix is
  better per-tool copy in `TOOL_META`, not noindexing the site's core product.
- 29 tool ids appear in two categories (e.g. `voltage-converter` in `units`
  and `converters2`). Both sites serve them; each canonicalises to itself.
  Acceptable for now — if it ever becomes a problem, add a `canonicalSite`
  field to the brand and emit a cross-domain canonical in `pages/[slug].js`.
