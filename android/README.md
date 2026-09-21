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
├── fingerprints.json         signing-key SHA-256s served in every site's assetlinks.json
├── keys/                     signing keystore (git-ignored — never commit it)
└── build/<id>/               Bubblewrap output (git-ignored): app-release-bundle.aab
```

Regenerate the configs whenever `brands.js` or the tool registry changes:

```bash
npm run android:generate
```

## Build all 29 apps (CI — the normal way)

GitHub → **Actions → android-build → Run workflow** (`sites` = `--all` or ids
like `pdf image json`). The workflow:

1. resolves the shared **upload keystore** — from the repository secrets
   `ANDROID_KEYSTORE_BASE64` + `ANDROID_KEYSTORE_PASSWORD`; if they are not set
   it reuses the `android-upload-keystore` artifact of an earlier run, and on the
   very first run it generates a key and saves it as that artifact (90 days);
2. builds every site in parallel with Bubblewrap (JDK 17, build-tools 36.1.0),
   `versionName 1.YYYYMMDD.HHMM`, `versionCode` = minutes since 2026-01-01
   (always increasing, so every run can be uploaded to Play);
3. verifies each APK is signed with that key and uploads artifacts:
   `android-<site>` (one app) and `toolsrift-android-apps-<version>` (all),
   each containing `<package>-<version>.aab` (Play Console) and `.apk` (sideload).

The run summary lists every app and the **upload key SHA-256**.

**After the first run (once):** download the `android-upload-keystore`
artifact, store `upload.keystore` (base64) and `upload.password` as the two
secrets above, keep a copy in a password manager, then delete the artifact.
Without the secrets a later run past the artifact's expiry would mint a *new*
key, and Play rejects uploads signed with a different upload key.

Icons and the web manifest are fetched from the hub (`toolsrift.com` serves
every brand's `/brands/<id>/` files and `/api/site/manifest?site=<id>`), so an
app can be built before its subdomain is serving — but it only opens
full-screen once the site is live and its assetlinks verify (next section).

## Make the apps verify (assetlinks)

Chrome opens a TWA full-screen only if `https://<domain>/.well-known/assetlinks.json`
lists the SHA-256 of the certificate the app is signed with. Every site serves
that file from `pages/api/site/assetlinks.js`, which reads
[`android/fingerprints.json`](fingerprints.json):

```json
{ "all": ["AB:CD:…"],          // the shared upload key — every app
  "pdf": ["12:34:…"] }         // extra keys for one app (Play App Signing key)
```

Put the upload key fingerprint from the workflow summary in `"all"`, commit,
push: the next deployment of every site serves it. `ANDROID_SHA256_FINGERPRINTS`
(comma-separated env var on a Vercel project) adds more without a commit.

## Play Console

For each app, `android/apps/<id>/play-listing.md` has everything the listing
needs: app name (≤30), short description (≤80), full description, category,
privacy-policy URL (`https://<domain>/privacy-policy` — served by the site),
icon path (`public/brands/<id>/icon-512.png`), and the Data safety answers.

1. Create the app → upload the `.aab` to Internal testing first.
2. **Enrol in Play App Signing** (default for new apps). Play then re-signs
   the app with *its* key: copy the "App signing key certificate" SHA-256 from
   Setup → App integrity and add it to `android/fingerprints.json` under that
   site's id (keep the upload key in `"all"`). Without this the Play-signed
   build opens with a browser bar instead of full-screen.
3. Feature graphic 1024×500: `android/apps/<id>/feature-graphic.png` (rendered
   by `npm run brands:assets`).
4. Screenshots: run the **android-listing** workflow (Actions → Run workflow);
   it captures the live site's home and top tools on a phone viewport and
   turns them into store frames (phone mockup on the brand background with a
   headline — `scripts/android/listing-frames.js`), renders a feature graphic
   with the same mockup, and uploads a `play-listing-assets` artifact: per app
   `01-home.png … 05-*.png` (1080×1920), `feature-graphic.png`, `icon-512.png`,
   `play-listing.md`, raw captures in `raw/`. Locally: `npm i --no-save playwright
   && npx playwright install chromium && node scripts/android/screenshots.js pdf
   && node scripts/android/listing-frames.js pdf` (→ `android/build/listing/pdf/`).
5. When the app is live on Play, set `android.published: true` on the brand in
   `brands.js`: the site's web manifest then prefers the Play app over the PWA
   install prompt (`related_applications`).

Once an app exists in the Console, the workflow can upload new versions for
you: add a Play service-account JSON (Play Console → Setup → API access) as the
`PLAY_SERVICE_ACCOUNT_JSON` secret and run the workflow with `play_track` =
`internal` (or `alpha` / `beta` / `production`).

## Build locally (optional)

```bash
npm i -g @bubblewrap/cli@1.25.0 && bubblewrap doctor   # installs JDK 17 + Android SDK
npm run android:keystore                                # android/keys/upload.keystore (or restore the CI one)
KEYSTORE_PASSWORD=… npm run android:build -- pdf        # android/build/pdf/app-release-bundle.aab
KEYSTORE_PASSWORD=… npm run android:build -- --all
```

`scripts/android/build.sh` is the same script CI runs (`BUBBLEWRAP`,
`KEYSTORE_PATH`, `ANDROID_VERSION_CODE/NAME` env overrides).

## Verifying assetlinks

```bash
curl -s https://pdf.toolsrift.com/.well-known/assetlinks.json
# → [{ "relation": ["delegate_permission/common.handle_all_urls"],
#      "target": { "namespace": "android_app", "package_name": "com.toolsrift.pdf",
#                  "sha256_cert_fingerprints": ["AB:CD:…"] } }]
```

Google's checker: `https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://pdf.toolsrift.com&relation=delegate_permission/common.handle_all_urls`

## Existing text app

`com.toolsrift.text.twa` (the app already published against `text.toolsrift.com`)
keeps its package id. Play only accepts updates signed with the key it already
knows: either rebuild it with that original keystore (`KEYSTORE_PATH=…
npm run android:build -- text`) or, if the app is enrolled in Play App Signing,
request an upload-key reset in the Console to the shared key. Put its current
certificate SHA-256 in `android/fingerprints.json` under `"text"` so the
published build keeps verifying.

## Why not Capacitor / React Native?

Every tool is a browser tool (Web Crypto, Canvas, Web Audio, pdf-lib in the
page). A TWA runs the real site in the real Chrome engine, so nothing has to
be ported, and 29 apps stay in lock-step with 29 sites. A native shell only
becomes worth it if you need native-only features (file system access beyond
the browser sandbox, background processing, in-app purchases), none of which
Phase 1 needs.

## Publishing to Google Play from CI (`android-publish`)

Once an app exists in Play Console, everything the Play Developer API allows
is one workflow run: **Actions → android-publish → Run workflow** (defaults:
`--all`, tracks `internal,alpha`, listing + bundle). It takes the graphics from
the latest successful `android-listing` run and the `.aab` files from the
latest successful `android-build` run (or the run ids you pass), then for each
app: sets the store listing text from `android/apps/<id>/play-listing.md`,
uploads icon / feature graphic / phone + 7" + 10" screenshots, uploads the
bundle and creates a completed release on every track — committed with
`changesNotSentForReview`, so nothing goes to Google until you click
**Send changes for review**. Apps that don't exist in the Console yet are
reported and skipped. Local: `PLAY_SERVICE_ACCOUNT_FILE=key.json npm run android:publish -- --sites pdf --dry-run`.

Needs the `PLAY_SERVICE_ACCOUNT_JSON` secret: a Google Cloud service account
key (JSON) whose email is invited in Play Console → Users and permissions with
Admin (all permissions). Never commit the key.

**Signing certificates → `android/fingerprints.json`**: copy EVERY certificate from
each app's *App integrity → App signing* page, not just the one in the Digital Asset
Links snippet. Play's quantum-ready signing (beta) puts two keys in use at once
(classical + post-quantum), and the snippet often still shows the *previous* key, so a
store build can be signed with any of them. The file already carries the shared upload
key under `all`; extra fingerprints cost nothing, a missing one makes the app open with
a browser address bar instead of full screen.

Still manual per app in the Console: **Create app**, the *Set up your app*
questionnaires (privacy policy, app access, ads, content rating, target
audience, data safety, advertising ID = no), ticking the tester list on the
internal and closed tracks, reading the App signing + Digital Asset Links
SHA-256 (→ `android/fingerprints.json`), and *Send changes for review*.
