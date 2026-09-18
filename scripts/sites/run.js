#!/usr/bin/env node
/**
 * scripts/sites/run.js — run Next.js for ONE network site.
 *
 *   npm run dev:site   -- pdf        → NEXT_PUBLIC_SITE_ID=pdf next dev
 *   npm run build:site -- image      → NEXT_PUBLIC_SITE_ID=image next build
 *   npm run start:site -- json       → NEXT_PUBLIC_SITE_ID=json next start -p 3000
 *
 * The site id is a category id or registry slug from lib/sites/brands.js.
 * `hub` (or nothing) runs toolsrift.com itself.
 */
const { spawnSync } = require('child_process');
const path = require('path');
const { findBrand, BRANDS } = require('../../lib/sites/brands');

const [cmd, siteArg = 'hub', ...rest] = process.argv.slice(2);
if (!['dev', 'build', 'start'].includes(cmd)) {
  console.error('usage: node scripts/sites/run.js <dev|build|start> <site-id> [next args]');
  process.exit(2);
}
const brand = siteArg === 'hub' ? null : findBrand(siteArg);
if (siteArg !== 'hub' && !brand) {
  console.error(`Unknown site "${siteArg}". Known: hub, ${BRANDS.map(b => b.id).join(', ')}`);
  process.exit(2);
}
const id = brand ? brand.id : 'hub';
console.log(`▶ next ${cmd} for site "${id}"${brand ? ` (${brand.domain})` : ' (toolsrift.com)'}`);

const next = path.join(__dirname, '..', '..', 'node_modules', '.bin', 'next');
const r = spawnSync(next, [cmd, ...rest], {
  stdio: 'inherit',
  env: { ...process.env, NEXT_PUBLIC_SITE_ID: id },
});
process.exit(r.status == null ? 1 : r.status);
