#!/usr/bin/env node
/**
 * scripts/android/generate.js
 * ----------------------------------------------------------------------------
 * Generates the Android app project inputs for every ToolsRift network site:
 *
 *   android/apps/<id>/twa-manifest.json   Bubblewrap (Trusted Web Activity) config
 *   android/apps/<id>/play-listing.md     Play Console listing copy (title,
 *                                         short/full description, category,
 *                                         privacy policy URL, keywords)
 *   android/apps/<id>/shortcuts.json      launcher shortcuts (top tools)
 *   android/apps.json                     index of all apps (package ids, domains)
 *
 * The apps are Trusted Web Activities: a thin native wrapper that opens the
 * site full-screen in Chrome, verified through /.well-known/assetlinks.json
 * (served per site by pages/api/site/assetlinks.js). One codebase → 29 Play
 * Store apps, each updated simply by deploying the website.
 *
 * Usage:  node scripts/android/generate.js
 * Then:   see android/README.md for `bubblewrap build` and signing.
 */
const fs = require('fs');
const path = require('path');
const { BRANDS } = require('../../lib/sites/brands');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(ROOT, 'android', 'apps');

function registry() {
  const src = fs.readFileSync(path.join(ROOT, 'lib', 'toolRegistry.js'), 'utf8');
  return JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('};') + 1));
}

// Build-time assets are fetched from the hub, which serves every brand's
// public/brands/<id>/ files: the app can be built before its site is live.
// The app itself is bound to the site's own host (host / fullScopeUrl).
const ASSET_HOST = 'https://toolsrift.com';

function twaManifest(b, tools) {
  const host = b.domain;
  return {
    packageId: b.android.packageId,
    host,
    name: b.android.appName,
    launcherName: b.android.shortName,
    display: 'standalone',
    orientation: 'portrait',
    themeColor: b.palette.bg,
    themeColorDark: b.palette.bg,
    navigationColor: b.palette.bg,
    navigationColorDark: b.palette.bg,
    navigationDividerColor: b.palette.surface2,
    navigationDividerColorDark: b.palette.surface2,
    backgroundColor: b.palette.bg,
    enableNotifications: false,
    startUrl: '/?source=twa',
    iconUrl: `${ASSET_HOST}/brands/${b.id}/icon-512.png`,
    maskableIconUrl: `${ASSET_HOST}/brands/${b.id}/icon-maskable-512.png`,
    splashScreenFadeOutDuration: 300,
    // One shared upload key for every app — scripts/android/keystore.sh
    // (locally) or the android-build workflow (CI). Play App Signing holds the
    // real app signing key; see android/README.md.
    signingKey: { path: '../../keys/upload.keystore', alias: 'upload' },
    appVersionName: '1.0.0',
    appVersionCode: 1,
    // Bubblewrap's ShortcutInfo fields (camelCase — not the web-manifest names).
    shortcuts: tools.slice(0, 4).map(t => ({
      name: t.name,
      shortName: t.name.length > 12 ? t.name.slice(0, 11) + '…' : t.name,
      url: `/${t.id}?source=shortcut`,
      chosenIconUrl: `${ASSET_HOST}/brands/${b.id}/icon-192.png`,
    })),
    generatorApp: 'bubblewrap-cli',
    // build.sh swaps this for the hub's /api/site/manifest?site=<id> copy while
    // the site itself is not yet serving it.
    webManifestUrl: `https://${host}/manifest.json`,
    fallbackType: 'customtabs',
    features: {},
    alphaDependencies: { enabled: false },
    enableSiteSettingsShortcut: true,
    isChromeOSOnly: false,
    isMetaQuest: false,
    fullScopeUrl: `https://${host}/`,
    minSdkVersion: 21,
    orientationLock: false,
    additionalTrustedOrigins: [],
    retainedBundles: [],
    appVersion: '1.0.0',
  };
}

function playListing(b, tools, categoryName) {
  const word = b.wordmark[1];
  const top = tools.slice(0, 12).map(t => `• ${t.name} — ${t.desc}`).join('\n');
  const full = `${b.android.appName} puts ${tools.length} free ${categoryName.toLowerCase()} in your pocket — ${b.tagline.toLowerCase()}

${b.concept.sub}

EVERYTHING RUNS ON YOUR DEVICE
No uploads, no accounts, no limits. Your files and text are processed locally, so nothing you work on ever leaves your phone. Most tools work fully offline once loaded.

POPULAR TOOLS
${top}
…and ${Math.max(0, tools.length - 12)} more.

WHY ${b.siteName.toUpperCase()}
✓ 100% free, forever
✓ No sign-up, no email, no tracking of your content
✓ Instant results — no waiting for a server
✓ Clean, ad-supported, no paywalls
✓ Part of the ToolsRift network of ${BRANDS.length} specialist tool sites

${b.siteName} is the ${word.toLowerCase()} edition of ToolsRift (toolsrift.com), the free online tools platform. The app is a lightweight wrapper around ${b.domain}, so every improvement to the website ships to the app automatically.
`;
  return `# Play Console listing — ${b.android.appName}

| Field | Value |
|---|---|
| Package id | \`${b.android.packageId}\` |
| App name (≤30) | ${b.android.appName} |
| Launcher name | ${b.android.shortName} |
| Category | ${b.android.playCategory} |
| Website | https://${b.domain} |
| Privacy policy | https://${b.domain}/privacy-policy |
| Support email | contact@toolsrift.com |
| Icon (512×512) | \`public/brands/${b.id}/icon-512.png\` |
| Feature graphic (1024×500) | \`android/apps/${b.id}/feature-graphic.png\` |
| Theme colour | ${b.palette.primary} |

## Short description (≤80 chars)

${b.android.shortDesc}

## Full description (≤4000 chars)

${full}

## Keywords / tags

${b.seo.keywords}

## Screenshots (phone, 1080×1920)

Taken by the \`android-listing\` workflow (artifact \`play-listing-assets\`, folder \`${b.id}/\`):

1. Home — the ${categoryName} dashboard
2. ${tools[0] ? tools[0].name : 'A tool'} in use
3. ${tools[1] ? tools[1].name : 'A tool'} in use
4. ${tools[2] ? tools[2].name : 'A tool'} in use
5. Tool page article (how-to + FAQ)

## Data safety form (declare)

- Data collected: none by the app itself. Google AdSense / Analytics on the website may collect approximate location, device identifiers and crash/diagnostic data for ads and analytics (optional, not linked to identity).
- Data shared: with Google (advertising) only.
- Encryption in transit: yes (HTTPS).
- Deletion request: contact@toolsrift.com.
`;
}

function main() {
  const reg = registry();
  fs.mkdirSync(OUT, { recursive: true });
  const index = [];
  for (const b of BRANDS) {
    const cat = reg[b.slug] || { name: b.siteName, tools: [] };
    const dir = path.join(OUT, b.id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'twa-manifest.json'), JSON.stringify(twaManifest(b, cat.tools), null, 2) + '\n');
    fs.writeFileSync(path.join(dir, 'play-listing.md'), playListing(b, cat.tools, cat.name));
    fs.writeFileSync(path.join(dir, 'shortcuts.json'), JSON.stringify(cat.tools.slice(0, 4).map(t => ({ name: t.name, url: `/${t.id}` })), null, 2) + '\n');
    index.push({
      id: b.id, slug: b.slug, domain: b.domain, siteName: b.siteName,
      packageId: b.android.packageId, appName: b.android.appName, shortName: b.android.shortName,
      playCategory: b.android.playCategory, tools: cat.tools.length,
      live: !!b.live,
    });
    console.log(`✓ ${b.id.padEnd(12)} ${b.android.packageId.padEnd(30)} ${cat.tools.length} tools`);
  }
  fs.writeFileSync(path.join(ROOT, 'android', 'apps.json'), JSON.stringify(index, null, 2) + '\n');
  console.log(`\n${index.length} apps → android/apps/  (index: android/apps.json)`);
}

main();
