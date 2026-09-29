#!/usr/bin/env node
// Prints the 29 branded category sections of toolsrift.com, one row each:
// URL path, former subdomain (now a 301), concept, tool count, Android app.
//   node scripts/sites/list.js          table
//   node scripts/sites/list.js --json   machine-readable
const fs = require('fs');
const path = require('path');
const { BRANDS, ANDROID_APPS, HUB_APP } = require('../../lib/sites/brands');

const src = fs.readFileSync(path.join(__dirname, '..', '..', 'lib', 'toolRegistry.js'), 'utf8');
const REG = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('};') + 1));

const rows = BRANDS.map(b => ({
  id: b.id,
  slug: b.slug,
  path: b.path,
  legacyDomain: b.legacyDomain,
  siteName: b.siteName,
  concept: b.concept.name,
  primary: b.palette.primary,
  tools: REG[b.slug] ? REG[b.slug].tools.length : 0,
  packageId: b.android.packageId,
  app: ANDROID_APPS.includes(b.id),
}));

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify(rows, null, 2) + '\n');
} else {
  const pad = (s, n) => String(s).padEnd(n);
  console.log(pad('id', 13) + pad('path', 14) + pad('former subdomain', 28) + pad('concept', 17) + pad('tools', 7) + 'android app');
  console.log('-'.repeat(110));
  for (const r of rows) {
    console.log(pad(r.id, 13) + pad(r.path, 14) + pad(r.legacyDomain, 28) + pad(r.concept, 17) + pad(r.tools, 7) + (r.app ? r.packageId : '-'));
  }
  console.log(`\n${rows.length} sections · ${rows.reduce((n, r) => n + r.tools, 0)} tools · apps: ${HUB_APP.android.packageId} + ${rows.filter(r => r.app).length} category apps`);
}
