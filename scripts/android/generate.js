#!/usr/bin/env node
/**
 * scripts/android/generate.js
 * ----------------------------------------------------------------------------
 * Generates the Android app project inputs for every ToolsRift app — the main
 * app (all tools, https://toolsrift.com/) plus the category apps listed in
 * ANDROID_APPS (lib/sites/brands.js), each opening https://toolsrift.com/<slug>/:
 *
 *   android/apps/<id>/twa-manifest.json   Bubblewrap (Trusted Web Activity) config
 *   android/apps/<id>/play-listing.md     Play Console listing copy (title,
 *                                         short/full description, category,
 *                                         privacy policy URL, keywords)
 *   android/apps/<id>/shortcuts.json      launcher shortcuts (top tools)
 *   android/apps.json                     index of all apps (package ids, start URLs)
 *
 * The apps are Trusted Web Activities: a thin native wrapper that opens
 * toolsrift.com full-screen in Chrome, verified through
 * https://toolsrift.com/.well-known/assetlinks.json (pages/api/site/assetlinks.js).
 * Each app is updated simply by deploying the website. Folders of apps no
 * longer in the list are removed.
 *
 * Usage:  node scripts/android/generate.js
 * Then:   see android/README.md for `bubblewrap build` and signing.
 */
const fs = require('fs');
const path = require('path');
const { BRANDS, HUB_APP, androidApps, appIcons } = require('../../lib/sites/brands');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(ROOT, 'android', 'apps');

function registry() {
  const src = fs.readFileSync(path.join(ROOT, 'lib', 'toolRegistry.js'), 'utf8');
  return JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('};') + 1));
}

// Every app is bound to toolsrift.com; the start URL and scope pick the section.
const HOST = 'toolsrift.com';
const ORIGIN = `https://${HOST}`;
const isHub = (b) => b.id === HUB_APP.id;
// "/" for the main app, "/pdf/" for the PDF app.
const scopePath = (b) => (isHub(b) ? '/' : `${b.path}/`);
const iconUrl = (file) => `${ORIGIN}/${file.replace(/^public\//, '')}`;

function twaManifest(b, tools) {
  const scope = scopePath(b);
  const icons = appIcons(b);
  return {
    packageId: b.android.packageId,
    host: HOST,
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
    startUrl: `${scope}?source=twa`,
    iconUrl: iconUrl(icons.icon512),
    maskableIconUrl: iconUrl(icons.maskable512),
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
      url: `${t.path}?source=shortcut`,
      chosenIconUrl: iconUrl(icons.icon192),
    })),
    generatorApp: 'bubblewrap-cli',
    // The section's own manifest (scope /<slug>/); the main app uses the site's.
    webManifestUrl: isHub(b) ? `${ORIGIN}/manifest.json` : `${ORIGIN}${b.path}/manifest.webmanifest`,
    fallbackType: 'customtabs',
    features: {},
    alphaDependencies: { enabled: false },
    enableSiteSettingsShortcut: true,
    isChromeOSOnly: false,
    isMetaQuest: false,
    fullScopeUrl: `${ORIGIN}${scope}`,
    minSdkVersion: 21,
    orientationLock: false,
    additionalTrustedOrigins: [],
    retainedBundles: [],
    appVersion: '1.0.0',
  };
}

function playListing(b, tools, categoryName) {
  const word = isHub(b) ? 'complete' : b.wordmark[1];
  const site = `${ORIGIN}${isHub(b) ? '' : b.path}`;
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
✓ ${isHub(b) ? `All ${BRANDS.length} tool collections of ToolsRift in one app` : `From ToolsRift — ${BRANDS.length} tool collections, one site`}

${b.siteName} is the ${word.toLowerCase()} edition of ToolsRift (toolsrift.com), the free online tools platform. The app is a lightweight wrapper around ${site.replace('https://', '')}, so every improvement to the website ships to the app automatically.
`;
  return `# Play Console listing — ${b.android.appName}

| Field | Value |
|---|---|
| Package id | \`${b.android.packageId}\` |
| App name (≤30) | ${b.android.appName} |
| Launcher name | ${b.android.shortName} |
| Category | ${b.android.playCategory} |
| Website | ${site} |
| Privacy policy | ${ORIGIN}/privacy-policy |
| Support email | contact@toolsrift.com |
| Icon (512×512) | \`${appIcons(b).icon512}\` |
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

// The tools an app opens on: the category's, or for the main app every tool,
// led by the first tool of a few popular categories (its shortcuts).
function appTools(b, reg) {
  const withPath = (slug) => (reg[slug] ? reg[slug].tools : []).map(t => ({ ...t, path: `/${slug}/${t.id}` }));
  if (!isHub(b)) {
    const cat = reg[b.slug] || { name: b.siteName, tools: [] };
    return { name: cat.name, tools: withPath(b.slug) };
  }
  const lead = ['pdf', 'images', 'text', 'financecalc'].map(slug => withPath(slug)[0]).filter(Boolean);
  const rest = Object.keys(reg).flatMap(withPath).filter(t => !lead.some(l => l.path === t.path));
  return { name: 'Online Tools', tools: [...lead, ...rest] };
}

function main() {
  const reg = registry();
  fs.mkdirSync(OUT, { recursive: true });
  const apps = androidApps();
  const index = [];
  for (const b of apps) {
    const { name, tools } = appTools(b, reg);
    const dir = path.join(OUT, b.id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'twa-manifest.json'), JSON.stringify(twaManifest(b, tools), null, 2) + '\n');
    fs.writeFileSync(path.join(dir, 'play-listing.md'), playListing(b, tools, name));
    fs.writeFileSync(path.join(dir, 'shortcuts.json'), JSON.stringify(tools.slice(0, 4).map(t => ({ name: t.name, url: t.path })), null, 2) + '\n');
    index.push({
      id: b.id, slug: b.slug, startUrl: `${ORIGIN}${scopePath(b)}`, siteName: b.siteName,
      packageId: b.android.packageId, appName: b.android.appName, shortName: b.android.shortName,
      playCategory: b.android.playCategory, tools: tools.length,
    });
    console.log(`✓ ${b.id.padEnd(12)} ${b.android.packageId.padEnd(30)} ${String(tools.length).padStart(4)} tools  ${ORIGIN}${scopePath(b)}`);
  }
  // Apps dropped from ANDROID_APPS: remove their generated folders.
  for (const d of fs.readdirSync(OUT)) {
    if (!apps.some(a => a.id === d)) {
      fs.rmSync(path.join(OUT, d), { recursive: true, force: true });
      console.log(`– ${d.padEnd(12)} removed (not in ANDROID_APPS)`);
    }
  }
  fs.writeFileSync(path.join(ROOT, 'android', 'apps.json'), JSON.stringify(index, null, 2) + '\n');
  console.log(`\n${index.length} apps → android/apps/  (index: android/apps.json)`);
}

main();
