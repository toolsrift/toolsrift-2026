#!/usr/bin/env node
/**
 * scripts/content-report.js — how much text is actually unique to each
 * indexable tool page, and which ones still read as thin.
 *
 *   npm run content:report            summary + the thinnest pages
 *   npm run content:report -- --all   every indexable page
 *
 * Thin pages are the reason for the August 2026 scaled-content action
 * (lib/coreTools.js). Long-form content lives in lib/toolContent.js.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { depthWords, hasDepth } = require('../lib/toolContent');

// coreTools.js and toolSeo.js are ES modules; read them as text like the
// sitemap script does, because this runs under plain node.
function coreIds() {
  const src = fs.readFileSync(path.join(ROOT, 'lib', 'coreTools.js'), 'utf8');
  const i = src.indexOf('CORE_TOOL_IDS = [');
  const body = src.slice(src.indexOf('[', i), src.indexOf('];', i));
  return new Set([...body.matchAll(/"([a-z0-9-]+)"/g)].map(m => m[1]));
}
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;

function main() {
  const core = coreIds();
  const reg = require('../lib/toolRegistry');
  const R = reg.default || reg;
  const SEO = require('../lib/toolSeo');
  const S = SEO.default || SEO;

  const rows = [];
  for (const [slug, cat] of Object.entries(R)) {
    for (const t of cat.tools) {
      if (!core.has(t.id)) continue;
      const e = (S[slug] || {})[t.id] || {};
      const short = words(e.howTo) + (e.faq || []).reduce((n, [q, a]) => n + words(q) + words(a), 0);
      rows.push({ slug, id: t.id, name: t.name, short, deep: depthWords(t.id), total: short + depthWords(t.id) });
    }
  }
  rows.sort((a, b) => a.total - b.total);

  const withDepth = rows.filter(r => r.deep > 0);
  const thin = rows.filter(r => r.total < 300);
  const avg = Math.round(rows.reduce((n, r) => n + r.total, 0) / rows.length);

  console.log(`indexable tool pages   ${rows.length}`);
  console.log(`with long-form content ${withDepth.length}  (${Math.round(withDepth.length / rows.length * 100)}%)`);
  console.log(`under 300 words        ${thin.length}`);
  console.log(`average unique words   ${avg}`);
  console.log('');

  const show = process.argv.includes('--all') ? rows : rows.slice(0, 20);
  console.log('site'.padEnd(13) + 'tool'.padEnd(26) + 'words');
  console.log('-'.repeat(52));
  for (const r of show) {
    console.log(r.slug.padEnd(13) + r.id.slice(0, 25).padEnd(26) + String(r.total).padStart(4) + (r.deep ? '  ✓' : ''));
  }
  if (!process.argv.includes('--all')) console.log(`\n(thinnest 20 of ${rows.length}; --all for the rest)`);
}

main();
