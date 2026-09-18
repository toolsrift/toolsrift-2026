# ToolsRift Network — 29 standalone category websites (+ Android apps)

> One codebase. Thirty build targets. Every category of ToolsRift becomes its
> own website with its own domain, logo, colours, typography, design concept,
> sitemap, PWA manifest and Android app — without copying a single tool.

| | |
|---|---|
| Hub | `toolsrift.com` — everything, unchanged (`NEXT_PUBLIC_SITE_ID` unset) |
| Network site | `toolsrift<category>.com` — one category at the root (`NEXT_PUBLIC_SITE_ID=<id>`) |
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
`toolsriftpdf.com`. Each site is still a *separate Vercel project*, with its own
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

| URL on toolsriftpdf.com | Serves |
|---|---|
| `/` | The PDF category app (branded header, "Paper & Ink" banner, tool dashboard) + the category article + network footer |
| `/merge-pdf` | The tool, opened directly, with server-rendered how-to / FAQ / related tools. Canonical = `https://toolsriftpdf.com/merge-pdf` |
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
npm run dev:site -- pdf          # http://localhost:3000 is toolsriftpdf.com
npm run build:site -- image      # production build of toolsriftimage.com
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

1. **Register the domain** (`toolsrift<category>.com`, see `npm run sites:list`).
   Change `domain` in `brands.js` if you buy a different name.
2. **Create the Vercel project**: `npm run vercel:bootstrap -- pdf` (or
   `--all`). It creates `toolsrift-pdf`, sets `NEXT_PUBLIC_SITE_ID=pdf` for
   all environments and attaches the domain. Connect the project to this Git
   repository in the Vercel dashboard (Settings → Git) so every push deploys it.
3. **DNS**: apex `A 76.76.21.21`, `www CNAME cname.vercel-dns.com`
   (www 301s to the apex via middleware).
4. **Env vars** on that project (Vercel → Settings → Environment Variables):
   - `NEXT_PUBLIC_SITE_ID` — set by bootstrap.
   - `ANDROID_SHA256_FINGERPRINTS` — after step 6, comma-separated (upload key
     **and** Play App Signing key).
   - `GOOGLE_SERVICE_ACCOUNT_KEY`, `CRON_SECRET` — optional, same as the hub;
     the daily cron resubmits *this* site's sitemap to its own Search Console
     property (`sc-domain:toolsrift<category>.com`).
5. **Flip `live: true`** for the brand in `brands.js` and push. From then on
   every other site (and the hub's network footer) links to the new domain
   instead of `toolsrift.com/<category>`.
6. **Search Console**: add the domain property, verify by DNS, submit
   `https://<domain>/sitemap.xml`. **AdSense**: add the site (ads.txt is
   served from `public/ads.txt` on every domain). **IndexNow**: the key file
   `public/509a…txt` is served on every domain, so
   `node scripts/submit-indexnow.js` works unchanged once `HOST` is that site
   (it reads the sitemap; run it from a checkout with `NEXT_PUBLIC_SITE_ID` set).
7. **Android**: see `android/README.md`.

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

- Every network site is a **new domain**: expect 3–6 months to rank. The hub
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
