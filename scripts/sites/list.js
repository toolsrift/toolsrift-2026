#!/usr/bin/env node
// Prints the ToolsRift network: one row per standalone site.
//   node scripts/sites/list.js          table
//   node scripts/sites/list.js --json   machine-readable (used by CI matrices)
const fs = require('fs');
const path = require('path');
const { BRANDS } = require('../../lib/sites/brands');

const src = fs.readFileSync(path.join(__dirname, '..', '..', 'lib', 'toolRegistry.js'), 'utf8');
const REG = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('};') + 1));

const rows = BRANDS.map(b => ({
  id: b.id,
  slug: b.slug,
  domain: b.domain,
  siteName: b.siteName,
  concept: b.concept.name,
  primary: b.palette.primary,
  tools: REG[b.slug] ? REG[b.slug].tools.length : 0,
  packageId: b.android.packageId,
  live: !!b.live,
  vercelProject: `toolsrift-${b.id}`,
}));

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify(rows, null, 2) + '\n');
} else {
  const pad = (s, n) => String(s).padEnd(n);
  console.log(pad('id', 13) + pad('domain', 28) + pad('concept', 17) + pad('tools', 7) + pad('package', 30) + 'live');
  console.log('-'.repeat(100));
  for (const r of rows) {
    console.log(pad(r.id, 13) + pad(r.domain, 28) + pad(r.concept, 17) + pad(r.tools, 7) + pad(r.packageId, 30) + (r.live ? 'yes' : 'no'));
  }
  console.log(`\n${rows.length} sites · ${rows.reduce((n, r) => n + r.tools, 0)} tools · ${rows.filter(r => r.live).length} live`);
}
