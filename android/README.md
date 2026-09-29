# ToolsRift Android apps — the main app + a few category apps

Every app is a **Trusted Web Activity (TWA)**: a small native Android app that
opens toolsrift.com full-screen in Chrome with no browser UI. Google Play
accepts TWAs, they get the site's PWA features (shortcuts, install, share
target), and — the important part — **updating an app means deploying the
website**. There is no second codebase.

| App | Package | Opens |
|---|---|---|
| ToolsRift (main, all 29 categories) | `com.toolsrift.main` | `https://toolsrift.com/` |
| PDF Tools | `com.toolsrift.pdf` | `https://toolsrift.com/pdf/` |
| Image Resizer & Compressor | `com.toolsrift.image` | `https://toolsrift.com/images/` |

The list is `ANDROID_APPS` in `lib/sites/brands.js` (plus `HUB_APP` for the
main app). **Why so few:** Google Play's spam policy ("repetitive content")
prohibits publishing many apps that are near-identical wrappers of one website,
and the penalty can hit the whole developer account. One strong main app plus
the two categories with real standalone demand on phones is safe and
concentrates installs and ratings. The PDF and Image apps already exist in Play
Console (closed testing, no installs); the main app is new — create it in the
Console before its first upload. The other 13 apps that were created in Play
Console for the old subdomains are retired: delete them there (see "Retiring
the other apps" below). To change the list, edit `ANDROID_APPS` and run
`npm run android:generate` (it removes the folders of dropped apps).

**Ads in the apps:** a TWA *is* Chrome, so the AdSense ads already on
toolsrift.com show inside the apps as they do on the website — that is how the
apps are monetised. AdMob does not apply: it needs native views, which a TWA
cannot overlay. AdMob would only make sense for a WebView or native app
(e.g. Capacitor), which is a different project.

```
android/
├── apps.json                 index of the apps (package ids, start URLs, tool counts)
├── apps/<id>/
│   ├── twa-manifest.json     Bubblewrap config — generated from lib/sites/brands.js
│   ├── play-listing.md       Play Console copy: title, descriptions, category, data safety
│   ├── shortcuts.json        launcher shortcuts (top 4 tools)
│   └── feature-graphic.png   1024×500 (category apps; npm run brands:assets)
├── fingerprints.json         signing-key SHA-256s served in toolsrift.com/.well-known/assetlinks.json
├── keys/                     signing keystore (git-ignored — never commit it)
└── build/<id>/               Bubblewrap output (git-ignored): app-release-bundle.aab
```

## Moving the existing apps from the subdomains to toolsrift.com

The category apps were first built for `pdf.toolsrift.com` etc. Those hosts
now 301 to `toolsrift.com/<slug>` (docs/NETWORK-SITES.md). What that means:

- **New builds** (`npm run android:generate` → `android-build`) have
  `host: toolsrift.com` and start at `/<slug>/`. They verify against
  `https://toolsrift.com/.well-known/assetlinks.json`, which lists every app.
  Same package ids, so each one is an ordinary update in Play Console.
- **Already-installed old builds** (the closed-testing testers) still start
  at the subdomain; the subdomain still serves assetlinks, so they launch, but
  the redirect to toolsrift.com — an origin the old build never declared —
  shows Chrome's address bar until the tester updates. Nothing breaks.
- Order: deploy the site → run `android-build` → `android-publish` (or upload
  the `.aab`s by hand) → promote in the Console.

## Retiring the other apps

These packages were created in Play Console for the old subdomains and are no
longer built: `com.toolsrift.json`, `.encoders`, `.colors`, `.css`, `.html`,
`.js`, `.formatters`, `.hash`, `.fancy`, `.encoding`, `.everyday`,
`.generators`, `.content` (check the exact ids in the Console). They are in
closed testing with no installs, so delete them (App → Settings → Advanced
settings → Delete app); if the Console only offers **Unpublish**, unpublish
instead. A deleted app's package id can never be used again — that is fine,
none of them will be reused. Their entries in `android/fingerprints.json` and
in assetlinks are harmless and can stay.


Regenerate the configs whenever `brands.js` or the tool registry changes:

```bash
npm run android:generate
```

## Build the apps (CI — the normal way)

GitHub → **Actions → android-build → Run workflow** (`sites` = `--all` or ids
like `hub pdf`). The workflow:

1. resolves the shared **upload keystore** — from the repository secrets
   `ANDROID_KEYSTORE_BASE64` + `ANDROID_KEYSTORE_PASSWORD`; if they are not set
   it reuses the `android-upload-keystore` artifact of an earlier run, and on the
   very first run it generates a key and saves it as that artifact (90 days);
2. builds every app in parallel with Bubblewrap (JDK 17, build-tools 36.1.0),
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

Icons and the web manifest are fetched from toolsrift.com (`/brands/<id>/`,
`/<slug>/manifest.webmanifest`, falling back to `/api/site/manifest?site=<id>`
before that route is deployed). An app only opens full-screen once its
assetlinks entry verifies (next section).

## Make the apps verify (assetlinks)

Chrome opens a TWA full-screen only if `https://toolsrift.com/.well-known/assetlinks.json`
lists the app's package with the SHA-256 of the certificate it is signed with.
The site serves one file for every app from `pages/api/site/assetlinks.js`
(also on the former subdomains, un-redirected, for old builds), which reads
[`android/fingerprints.json`](fingerprints.json):

```json
{ "all": ["AB:CD:…"],          // the shared upload key — every app
  "hub": ["…"],                // the main app's Play App Signing key(s)
  "pdf": ["12:34:…"] }         // extra keys for one app (Play App Signing key)
```

Put the upload key fingerprint from the workflow summary in `"all"`, commit,
push: the next deployment serves it. `ANDROID_SHA256_FINGERPRINTS`
(comma-separated env var on the Vercel project) adds more without a commit.

## Play Console

For each app, `android/apps/<id>/play-listing.md` has everything the listing
needs: app name (≤30), short description (≤80), full description, category,
privacy-policy URL (`https://<domain>/privacy-policy` — served by the site),
icon path (`public/brands/<id>/icon-512.png`), and the Data safety answers.

1. Create the app → upload the `.aab` to Internal testing first.
2. **Enrol in Play App Signing** (default for new apps). Play then re-signs
   the app with *its* key: copy the "App signing key certificate" SHA-256 from
   Setup → App integrity and add it to `android/fingerprints.json` under that
   app's id (`hub` for the main app; keep the upload key in `"all"`). Without this the Play-signed
   build opens with a browser bar instead of full-screen.
3. Feature graphic 1024×500: `android/apps/<id>/feature-graphic.png` (rendered
   by `SHARE_ONLY=1 npm run brands:assets`; for the main app it comes from the
   `android-listing` workflow).
4. Screenshots: run the **android-listing** workflow (Actions → Run workflow);
   it captures the live site's home and top tools on a phone viewport and
   turns them into store frames (phone mockup on the brand background with a
   headline — `scripts/android/listing-frames.js`), renders a feature graphic
   with the same mockup, and uploads a `play-listing-assets` artifact: per app
   `01-home.png … 05-*.png` (1080×1920), `feature-graphic.png`, `icon-512.png`,
   `play-listing.md`, raw captures in `raw/`. Locally: `npm i --no-save playwright
   && npx playwright install chromium && node scripts/android/screenshots.js pdf
   && node scripts/android/listing-frames.js pdf` (→ `android/build/listing/pdf/`).
5. When a category app is live on Play, set `android.published: true` on the
   brand in `brands.js`: the section's web manifest then prefers the Play app
   over the PWA install prompt (`related_applications`).

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
curl -s https://toolsrift.com/.well-known/assetlinks.json
# → [{ "relation": ["delegate_permission/common.handle_all_urls"],
#      "target": { "namespace": "android_app", "package_name": "com.toolsrift.main",
#                  "sha256_cert_fingerprints": ["AB:CD:…"] } },
#    { … "package_name": "com.toolsrift.pdf" … }, …]
```

Google's checker: `https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://toolsrift.com&relation=delegate_permission/common.handle_all_urls`

## The text app: package id and certificate of unverified origin

This section used to state that `com.toolsrift.text.twa` was "already published
against `text.toolsrift.com`". **That could not be verified, and the evidence is
against it.** Treat the claim as unproven.

What is actually known, as of 2026-09-25:

- **No such app exists on any reachable Play Console account.** The ToolsRift.com
  developer account (personal, ID 6750908984851878480) holds exactly 15 apps, all
  in closed testing with 0 installs, and the account has never had an app in
  production. Searching its app list for "text", "toolsrift" and "twa" returns
  nothing, and no other Google account signed in alongside it has a developer
  account at all.
- **The certificate predates the repo's own history.** `AB:54:5C:86:…` arrived in
  the initial bulk project import (`e60c7ce`, 2026-07-02, "Add files via upload");
  `d3d0c47` fifteen minutes later only converted the assetlinks from a JS route to
  static JSON. There is no commit in which it was generated or recorded from a
  Play Console listing.
- **`text` is the one brand carrying Bubblewrap's default `.twa` suffix.** The
  other 28 use a bare `com.toolsrift.<id>`. That looks like a leftover default
  rather than a deliberate choice — but see below before "fixing" it.

### Why the package id is left alone

If an app with this id *does* exist on an account nobody here can sign into, a
rename would orphan the live listing: Play never accepts a renamed package, and
only accepts updates signed with the key it already knows. That downside is
permanent; the upside of a tidier id is cosmetic. So it stays until someone
proves the app does not exist — the check is the public listing at
`play.google.com/store/apps/details?id=com.toolsrift.text.twa`, whose developer
name would name the owning account.

If it is confirmed absent, rename it to `com.toolsrift.text` in
`lib/sites/brands.js`, run `npm run android:generate`, and drop the certificate
below. Do that BEFORE the app is created in Play — afterwards the id is fixed
forever.

### Why the certificate stays in fingerprints.json

`android/fingerprints.json` carries `AB:54:5C:86:…` under `"text"`, so
`toolsrift.com/.well-known/assetlinks.json` declares it for
`com.toolsrift.text.twa` alongside the shared upload key. toolsrift.com has
declared that same certificate since July, so keeping it extends an existing
trust declaration rather than creating a new one —
and if the app is real, removing it would break the app. It is not evidence the
app exists.

When a text app is genuinely created, it will be signed with the shared upload
key (already under `"all"`) plus a Play App Signing certificate Google issues at
that point. Add that one here; this entry can then go.

## Why not Capacitor / React Native?

Every tool is a browser tool (Web Crypto, Canvas, Web Audio, pdf-lib in the
page). A TWA runs the real site in the real Chrome engine, so nothing has to
be ported, and every app stays in lock-step with the website. A native shell only
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
**Send changes for review**. Exception: when an app's changes "are sent for
review automatically" in the Console, Play refuses that flag, and the
workflow's fallback commit **does** submit them for review; the log and the
run summary mark those apps "sent for review automatically". Apps that don't exist in the Console yet are
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
