# ToolsRift category sections — one domain, 29 branded "sites"

> Every category of ToolsRift is its own branded section of **toolsrift.com**:
> `toolsrift.com/pdf`, `toolsrift.com/images`, `toolsrift.com/json`, … Each has
> its own logo lockup, palette, typography, texture, concept copy and web
> manifest, and a few have an Android app. All of it is one site, one
> Vercel project, one sitemap and one Search Console property.

| | |
|---|---|
| Section home | `toolsrift.com/<slug>` — `pages/<slug>.js` → `components/site/SectionHome.jsx` |
| Tool page | `toolsrift.com/<slug>/<tool-id>` — `pages/[slug]/[tool].js` |
| Brand registry | `lib/sites/brands.js` — the single source of truth for all 29 brands |
| List them | `npm run sites:list` |
| Validate | `npm run sites:check` |
| Smoke-test a build | `npm run sites:smoke -- http://localhost:3000` |
| Check production | `npm run sites:live` |

## 1. Why subfolders and not subdomains

From 2026-09-18 each category was briefly its own subdomain (`pdf.toolsrift.com`, …)
built as a separate Vercel project. It was moved back under toolsrift.com ten
days later, before the subdomains had been indexed, because:

- **Authority is shared.** Google treats a subdomain largely as a separate
  site. Under one domain every backlink and every ranking signal earned by any
  tool helps all of them. For a young domain this is the biggest lever there is.
- **Depth, not 29 thin sites.** The site already carries a scaled-content
  action (`lib/coreTools.js`, `lib/toolContent.js`). Site-wide quality signals
  favour one deep site over many shallow ones.
- **Operations.** One project and one deploy instead of 30 projects, a daily
  catch-up deploy for the Hobby quota, nightly pruning and 30 sitemaps.

None of the branding was lost: the look is chosen by the URL path instead of
the host.

## 2. How a section is branded

```
 lib/sites/brands.js  (29 brands: path, legacyDomain, palette, fonts, concept, logo, android)
          │
          ├─ lib/categoryThemes.js   every category theme carries its brand: accent colours,
          │                          fonts via var(--tr-font-*), `theme.brand`
          ├─ lib/designTokens.js     COLORS / RADIUS are CSS variables with the original
          │                          ToolsRift values as fallbacks; sectionCss(brand) sets them
          ├─ components/site/SectionHead.jsx   in <head> of every section page: the CSS
          │                          variables, brand Google Fonts, the section manifest,
          │                          theme-color, OG image (keys override pages/_app.js)
          ├─ components/shared/CategoryLayout.jsx   BrandLogo lockup → /<slug>, BrandBackdrop
          │                          texture, concept headline in the banner
          └─ components/SiteFooter.jsx   section logo + tagline, links to every category
```

Because the variables are rendered server-side in `<head>`, the section's
palette, radius scale and fonts are in place before first paint. Pages outside
a section (home, `/tools`, legal pages) set no variables and look exactly as
before.

The tool bodies themselves (the 3,000-line category components) are
untouched: they were built on neutral dark surfaces, which is why every
palette is a dark family with its own hue rather than a light theme.

Per-section files:

| URL | Serves |
|---|---|
| `/<slug>` | Section home: branded category app + server-rendered category article |
| `/<slug>/<tool-id>` | Tool page: branded, with server-rendered how-to, long-form content (`lib/toolContent.js`), FAQ, related tools |
| `/<slug>/manifest.webmanifest` | The section's PWA manifest (scope `/<slug>/`) — middleware rewrite to `pages/api/site/manifest.js` |
| `/.well-known/assetlinks.json` | Every Android app's verification — `pages/api/site/assetlinks.js` |

## 3. The former subdomains

Every brand keeps its `legacyDomain` (`pdf.toolsrift.com`, …). `middleware.js`
301s every URL on it to the same page under toolsrift.com
(`lib/sites/index.js → legacyPath`):

| Old URL | New URL |
|---|---|
| `pdf.toolsrift.com/` | `toolsrift.com/pdf` |
| `pdf.toolsrift.com/merge-pdf` | `toolsrift.com/pdf/merge-pdf` |
| `pdf.toolsrift.com/privacy-policy` | `toolsrift.com/privacy-policy` |
| `pdf.toolsrift.com/manifest.json` | `toolsrift.com/pdf/manifest.webmanifest` |
| `pdf.toolsrift.com/.well-known/assetlinks.json` | **served, not redirected** — Android's verifier does not follow redirects, and app builds made for the subdomain still check it |

`www.` and any other stray subdomain 301 to the apex with the same path. Keep
the redirects forever: old links, bookmarks and old app installs use them.

The redirects work wherever the subdomain is attached:

- **on the hub project** — matched by host;
- **on a leftover per-category project** (`toolsrift-<id>`) — those builds still
  resolve a site id (`NEXT_PUBLIC_SITE_ID` or the project name, see
  `next.config.js`) and then redirect *every* request, `*.vercel.app` included.

## 4. Consolidating the Vercel projects (one-time)

1. **Deploy the hub** from main: Actions → `vercel-deploy-unlinked` → Run
   workflow (no input = the hub, if behind main). Do NOT deploy the old
   `toolsrift-<id>` projects before the hub is on the new build: they would
   redirect to `toolsrift.com/<slug>` while the old hub redirects back — a loop.
   (That happened once when the quota ran out mid-run; `vercel-rollback-legacy`
   undoes it with Instant Rollback, which costs no deployment quota.)
2. **Move the subdomains onto the hub**: Actions → `vercel-consolidate` → Run
   workflow with `apply` ticked (`scripts/vercel/consolidate.js`). Unticked it
   only reports. It refuses to run until toolsrift.com serves the new build.
3. **Check production**: Actions → `sites-live-check` (every former subdomain
   must 301 and serve assetlinks; every sitemap URL must answer 200).
4. **Delete the old projects**: `vercel-consolidate` again with `apply` +
   `delete_projects`. Permanent — only after step 3 is green.
5. **Search Console** (`sc-domain:toolsrift.com`): the property already covers
   everything. Resubmit `https://toolsrift.com/sitemap.xml` (it is a single
   urlset now, no longer an index). Remove any per-subdomain sitemaps that were
   submitted by hand.

After step 4, `vercel-deploy-unlinked` and `vercel-prune` only ever touch the
hub project.

### Vercel Hobby quotas (until the team is on Pro)

- 100 deployments per **rolling** 24 h. Git-triggered deployments stay off for
  `main` and the working branches (`vercel.json → git.deploymentEnabled`); the
  daily `vercel-deploy-unlinked` run at 17:00 UTC is the production deploy.
  Urgent change? Run it by hand.
- **Deployment Storage (10 GB)**: `vercel-prune` (nightly 18:30 UTC) deletes
  all but the live production deployment plus one rollback per project.
- Hobby also forbids commercial (ad-monetised) use; upgrade to Pro before launch.

## 5. Daily workflow

```bash
npm run dev                       # everything, http://localhost:3000/pdf etc.
npm run build && npm start        # production build
npm run sites:smoke -- http://localhost:3000   # section + redirect checks
```

Changing a brand (`lib/sites/brands.js`):

- colours, fonts, concept copy: nothing to regenerate — the pages read the
  registry directly;
- logo spec or glyph: `LOGO_ONLY=1 npm run brands:assets` (header/footer lockup);
- share images: `SHARE_ONLY=1 npm run brands:assets` (OG image + app feature
  graphics; leaves the Play Store icons alone);
- anything an app shows: `npm run android:generate`;
- then `npm run sites:check` and commit the generated files.

Adding a tool follows the mandatory workflow in CLAUDE.md (`extract-tools.py`,
`extract-seo.js`, `generate-sitemap.js`).

## 6. Adding a 30th category

1. Add the category component + registry entry as usual (CLAUDE.md).
2. Add a theme entry in `lib/categoryThemes.js` and a brand in
   `lib/sites/brands.js` (same `id`, registry `slug`; `legacyDomain` can be
   `<slug>.toolsrift.com` — it only ever redirects).
3. Add `pages/<slug>.js` (copy any other section page: it is one
   `<SectionHome>` element with the title and description).
4. Add a glyph in `scripts/brand-glyphs.js`, then
   `npm run brands:assets -- <id> && npm run sites:check`.
5. Register the slug in `lib/sites/categoryComponents.js` and both extract scripts.

## 7. Android apps

One main app (`com.toolsrift.main`, opens `/`) plus the categories listed in
`ANDROID_APPS` in `lib/sites/brands.js` (each opens `/<slug>/`). Google Play's
spam policy bars many near-identical apps from one account, so the list is
kept short on purpose. Full guide: `android/README.md`.

## 8. SEO notes

- Canonicals, sitemap, schema and breadcrumbs all use
  `https://toolsrift.com/<slug>[/<tool-id>]`.
- Tool pages follow the `lib/coreTools.js` allowlist (non-core → `noindex`, out
  of the sitemap).
- 29 tool ids appear in two categories (e.g. `voltage-converter` in `units`
  and `converters2`). Both pages exist; both canonicalise to the category the
  registry lists first (`lib/canonicalCat.js`), and only that URL is in the sitemap.
