# ToolsRift Android apps — one per network site

Every standalone site ships as a **Trusted Web Activity (TWA)**: a small native
Android app that opens the site full-screen in Chrome with no browser UI. Google
Play accepts TWAs, they get the site's PWA features (offline cache, shortcuts,
share target), and — the important part — **updating the app means deploying
the website**. There is no second codebase to maintain for 29 apps.

```
android/
├── apps.json                 index of all 29 apps (package ids, domains, tool counts)
├── apps/<id>/
│   ├── twa-manifest.json     Bubblewrap config — generated from lib/sites/brands.js
│   ├── play-listing.md       Play Console copy: title, descriptions, category, data safety
│   └── shortcuts.json        launcher shortcuts (top 4 tools)
├── keys/                     signing keystores (git-ignored — back them up!)
└── build/<id>/               Bubblewrap output (git-ignored): app-release-bundle.aab
```

Regenerate the configs whenever `brands.js` or the tool registry changes:

```bash
npm run android:generate
```

## Prerequisites (once)

```bash
npm i -g @bubblewrap/cli
bubblewrap doctor          # offers to install the JDK + Android SDK it needs
```

The site **must already be live on its domain** before you build its app:
Bubblewrap downloads the icons and `manifest.json` from `https://<domain>/`,
and Chrome verifies the app against `https://<domain>/.well-known/assetlinks.json`.

## Build one app

```bash
# 1. signing key (prints the SHA-256 fingerprint)
npm run android:keystore -- pdf

# 2. put that fingerprint in the site's Vercel env and redeploy
#    ANDROID_SHA256_FINGERPRINTS=AB:CD:...   (project toolsrift-pdf)
#    → https://toolsriftpdf.com/.well-known/assetlinks.json now lists it

# 3. build
npm run android:build -- pdf
#    → android/build/pdf/app-release-bundle.aab  (upload this to Play Console)
#    → android/build/pdf/app-release-signed.apk  (sideload to test)
```

`npm run android:build -- --all` builds all 29 in sequence (set
`KEYSTORE_PASSWORD` to avoid 29 prompts).

## Play Console

For each app, `android/apps/<id>/play-listing.md` has everything the listing
needs: app name (≤30), short description (≤80), full description, category,
privacy-policy URL (`https://<domain>/privacy-policy` — served by the site),
icon path (`public/brands/<id>/icon-512.png`), and the Data safety answers.

1. Create the app → upload the `.aab` to Internal testing first.
2. **Enrol in Play App Signing** (default for new apps). Play then re-signs
   the app with *its* key: copy the "App signing key certificate" SHA-256 from
   Setup → App integrity and **add it** to `ANDROID_SHA256_FINGERPRINTS`
   (comma-separated with your upload key), redeploy the site. Without this the
   Play-signed build opens with a browser bar instead of full-screen.
3. Feature graphic 1024×500: export `public/brands/<id>/og.svg` at that size.
4. Screenshots: phone 1080×1920 of the home, three tools and a tool article.

## Verifying assetlinks

```bash
curl -s https://toolsriftpdf.com/.well-known/assetlinks.json
# → [{ "relation": ["delegate_permission/common.handle_all_urls"],
#      "target": { "namespace": "android_app", "package_name": "com.toolsrift.pdf",
#                  "sha256_cert_fingerprints": ["AB:CD:…"] } }]
```

Google's checker: `https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://toolsriftpdf.com&relation=delegate_permission/common.handle_all_urls`

## Existing text app

`com.toolsrift.text.twa` (the app already built against `text.toolsrift.com`)
keeps its package id and fingerprint in `brands.js` → `text.android`. Rebuilding
it from `android/apps/text/twa-manifest.json` moves it to `toolsrifttext.com`
as an ordinary update; the hub keeps `public/.well-known/assetlinks.json` so
the old host stays verified during the transition.

## Why not Capacitor / React Native?

Every tool is a browser tool (Web Crypto, Canvas, Web Audio, pdf-lib in the
page). A TWA runs the real site in the real Chrome engine, so nothing has to
be ported, and 29 apps stay in lock-step with 29 sites. A native shell only
becomes worth it if you need native-only features (file system access beyond
the browser sandbox, background processing, in-app purchases), none of which
Phase 1 needs.
