#!/usr/bin/env node
// Consistency checks for the network registry. Run in CI and before adding a
// site:  node scripts/sites/check.js
//
//  • every brand id exists in lib/categoryThemes.js and its slug in the registry
//  • every registry category has a brand (a category without a site is a bug)
//  • domains, package ids and site names are unique
//  • Play Store limits: appName ≤ 30, shortName ≤ 12, shortDesc ≤ 80
//  • glyphs exist and generated assets are present
const fs = require('fs');
const path = require('path');
const { BRANDS } = require('../../lib/sites/brands');
const GLYPHS = require('../brand-glyphs');

const ROOT = path.join(__dirname, '..', '..');
const regSrc = fs.readFileSync(path.join(ROOT, 'lib', 'toolRegistry.js'), 'utf8');
const REG = JSON.parse(regSrc.slice(regSrc.indexOf('{'), regSrc.lastIndexOf('};') + 1));
const themesSrc = fs.readFileSync(path.join(ROOT, 'lib', 'categoryThemes.js'), 'utf8');
const THEME_IDS = new Set([...themesSrc.matchAll(/\{\s*id:\s*'([a-z0-9-]+)'/g)].map(m => m[1]));

const errors = [];
const seen = { domain: new Map(), pkg: new Map(), name: new Map() };

for (const b of BRANDS) {
  const tag = `[${b.id}]`;
  if (!THEME_IDS.has(b.id)) errors.push(`${tag} no category with id "${b.id}" in lib/categoryThemes.js`);
  if (!REG[b.slug]) errors.push(`${tag} no registry category with slug "${b.slug}" in lib/toolRegistry.js`);
  for (const [k, v] of [['domain', b.domain], ['pkg', b.android.packageId], ['name', b.siteName]]) {
    if (seen[k].has(v)) errors.push(`${tag} duplicate ${k} "${v}" (also ${seen[k].get(v)})`);
    seen[k].set(v, b.id);
  }
  if (!/^([a-z0-9-]+\.)+[a-z]+$/.test(b.domain) || /^www\./.test(b.domain)) errors.push(`${tag} domain "${b.domain}" is not a bare hostname`);
  if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(b.android.packageId)) errors.push(`${tag} bad Android package id "${b.android.packageId}"`);
  if (b.android.appName.length > 30) errors.push(`${tag} appName > 30 chars (${b.android.appName.length})`);
  if (b.android.shortName.length > 12) errors.push(`${tag} shortName > 12 chars (${b.android.shortName.length})`);
  if (b.android.shortDesc.length > 80) errors.push(`${tag} shortDesc > 80 chars (${b.android.shortDesc.length})`);
  if (!GLYPHS[b.logo.glyph]) errors.push(`${tag} no glyph "${b.logo.glyph}" in scripts/brand-glyphs.js`);
  for (const f of ['logo.svg', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'og.png']) {
    if (!fs.existsSync(path.join(ROOT, 'public', 'brands', b.id, f))) errors.push(`${tag} missing public/brands/${b.id}/${f} — run npm run brands:assets`);
  }
  for (const k of ['bg', 'surface', 'primary', 'primaryDark', 'accent2']) {
    if (!/^#[0-9A-Fa-f]{6}$/.test(b.palette[k])) errors.push(`${tag} palette.${k} must be a 6-digit hex`);
  }
}
// android/fingerprints.json — the keys every site's assetlinks.json lists.
{
  const fpPath = path.join(ROOT, 'android', 'fingerprints.json');
  const FP_RE = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/;
  try {
    const fp = JSON.parse(fs.readFileSync(fpPath, 'utf8'));
    for (const [k, v] of Object.entries(fp)) {
      // Any "//"-prefixed key is a comment, not a site: "//" for the file-level
      // note, "//<site id>" to explain one entry (see "//text").
      if (k.startsWith('//')) continue;
      if (k !== 'all' && !BRANDS.some(b => b.id === k)) errors.push(`android/fingerprints.json: "${k}" is not "all" or a site id`);
      if (!Array.isArray(v)) { errors.push(`android/fingerprints.json: "${k}" must be an array`); continue; }
      for (const f of v) if (!FP_RE.test(String(f).toUpperCase())) errors.push(`android/fingerprints.json: "${k}" has a malformed SHA-256 fingerprint "${f}"`);
    }
    if (!(fp.all || []).length) console.log('note: android/fingerprints.json "all" is empty — apps open with a browser bar until the upload key fingerprint is added (android/README.md)');
  } catch (e) { errors.push(`android/fingerprints.json: ${e.message}`); }
}
for (const slug of Object.keys(REG)) {
  if (!BRANDS.some(b => b.slug === slug)) errors.push(`registry category "${slug}" has no brand in lib/sites/brands.js`);
}

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):\n  - ` + errors.join('\n  - '));
  process.exit(1);
}
console.log(`✓ ${BRANDS.length} brands consistent with ${Object.keys(REG).length} registry categories`);
