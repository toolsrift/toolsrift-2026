#!/usr/bin/env node
// Checks the LIVE site the way Google sees it, as Googlebot:
//   • toolsrift.com: robots.txt, sitemap.xml and every <loc> in it (each must
//     answer 200 directly — a redirect or error in a sitemap is a defect
//     Search Console reports);
//   • every former category subdomain (pdf.toolsrift.com, …): / and a tool URL
//     must 301 straight to toolsrift.com/<slug>/…, and
//     /.well-known/assetlinks.json must answer 200 (Android app verification).
//
//   node scripts/sites/check-live.js            the hub + every former subdomain
//   node scripts/sites/check-live.js pdf json   the hub + just these (id, slug or subdomain)
//
// Exit code 1 on any problem. Needs outbound HTTPS (CI runners have it).
const fs = require('fs');
const path = require('path');
const { BRANDS } = require('../../lib/sites/brands');

// First tool id per category, to test a deep redirect.
const TOOLS = (() => {
  const src = fs.readFileSync(path.join(__dirname, '..', '..', 'lib', 'toolRegistry.js'), 'utf8');
  const reg = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('};') + 1));
  return Object.fromEntries(Object.entries(reg).map(([slug, c]) => [slug, (c.tools || []).map(t => t.id)]));
})();

const UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const HEADERS = ['content-type', 'cache-control', 'x-vercel-cache', 'age', 'x-vercel-id', 'x-matched-path'];

async function get(url, method = 'GET') {
  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      method,
      redirect: 'manual',
      headers: { 'User-Agent': UA, 'Accept-Encoding': 'gzip' },
      signal: AbortSignal.timeout(20000),
    });
    const body = method === 'GET' ? await res.text() : '';
    const h = Object.fromEntries(HEADERS.map(k => [k, res.headers.get(k)]).filter(([, v]) => v));
    return { status: res.status, location: res.headers.get('location'), body, h, ms: Date.now() - t0 };
  } catch (err) {
    return { status: 0, error: err.cause?.code || err.name || err.message, body: '', h: {}, ms: Date.now() - t0 };
  }
}

const fmtHeaders = h => Object.entries(h).map(([k, v]) => `${k}=${v}`).join('  ');

async function checkSite(domain) {
  const problems = [];
  const lines = [];
  const base = `https://${domain}`;

  const robots = await get(`${base}/robots.txt`);
  lines.push(`  robots.txt   ${robots.status || robots.error}  ${robots.ms}ms  ${fmtHeaders(robots.h)}`);
  if (robots.status !== 200) problems.push(`robots.txt answered ${robots.status || robots.error}`);
  else if (!robots.body.includes(`Sitemap: ${base}/sitemap.xml`)) problems.push('robots.txt does not reference its own sitemap');

  const sm = await get(`${base}/sitemap.xml`);
  lines.push(`  sitemap.xml  ${sm.status || sm.error}  ${sm.ms}ms  ${sm.body.length}B  ${fmtHeaders(sm.h)}`);
  if (sm.status !== 200) {
    problems.push(`sitemap.xml answered ${sm.status || sm.error}${sm.location ? ` -> ${sm.location}` : ''}`);
    return { domain, problems, lines };
  }
  if (!/xml/i.test(sm.h['content-type'] || '')) problems.push(`sitemap content-type is ${sm.h['content-type']}`);
  if (!sm.body.startsWith('<?xml')) problems.push(`sitemap does not start with an XML declaration: ${JSON.stringify(sm.body.slice(0, 60))}`);
  if (!/<\/(urlset|sitemapindex)>\s*$/.test(sm.body)) problems.push('sitemap XML is truncated (no closing root tag)');

  const locs = [...sm.body.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1].trim());
  lines.push(`  ${locs.length} <loc> entries`);
  if (!locs.length) problems.push('sitemap has no <loc> entries');

  const isIndex = /<sitemapindex/i.test(sm.body);
  for (const loc of locs) {
    let host;
    try { host = new URL(loc).host; } catch (_) { problems.push(`invalid URL in sitemap: ${loc}`); continue; }
    // A sitemap may only list URLs on its own host.
    if (!isIndex && host !== domain) problems.push(`off-host URL in sitemap: ${loc}`);
    const r = await get(loc, isIndex ? 'GET' : 'HEAD');
    if (r.status !== 200) problems.push(`${loc} answered ${r.status || r.error}${r.location ? ` -> ${r.location}` : ''}`);
  }
  return { domain, problems, lines };
}

async function checkLegacy(b) {
  const problems = [];
  const lines = [];
  const base = `https://${b.legacyDomain}`;
  const tool = (TOOLS[b.slug] || [])[0];
  const cases = [['/', `https://toolsrift.com${b.path}`]];
  if (tool) cases.push([`/${tool}`, `https://toolsrift.com${b.path}/${tool}`]);
  for (const [path, to] of cases) {
    const r = await get(`${base}${path}`);
    lines.push(`  ${path.padEnd(28)} ${r.status || r.error}  -> ${r.location || '-'}`);
    if (r.status !== 301 || r.location !== to) problems.push(`${path} answered ${r.status || r.error} -> ${r.location || '-'} (want 301 -> ${to})`);
  }
  const al = await get(`${base}/.well-known/assetlinks.json`);
  lines.push(`  /.well-known/assetlinks.json ${al.status || al.error}`);
  if (al.status !== 200 || !al.body.includes(b.android.packageId)) problems.push(`assetlinks.json answered ${al.status || al.error} without ${b.android.packageId}`);
  return { domain: b.legacyDomain, problems, lines };
}

(async () => {
  const want = process.argv.slice(2);
  // A category may be named by brand id, category slug or old subdomain: the
  // JSON category is id "code", slug "json", host json.toolsrift.com.
  const names = b => [b.id, b.slug, b.legacyDomain.split('.')[0]];
  const unknown = want.filter(w => !BRANDS.some(b => names(b).includes(w)));
  if (unknown.length) {
    console.error(`Unknown category: ${unknown.join(', ')} (see npm run sites:list)`);
    process.exit(2);
  }
  const legacy = BRANDS.filter(b => !want.length || names(b).some(n => want.includes(n)));

  const results = [await checkSite('toolsrift.com')];
  for (const b of legacy) results.push(await checkLegacy(b));

  let bad = 0;
  for (const { domain, problems, lines } of results) {
    console.log(`${problems.length ? 'FAIL' : 'ok  '}  ${domain}`);
    lines.forEach(l => console.log(l));
    problems.forEach(p => console.log(`  ! ${p}`));
    if (problems.length) bad++;
  }
  console.log(`\n${results.length - bad}/${results.length} hosts as expected (hub readable, former subdomains redirecting).`);
  process.exitCode = bad ? 1 : 0;
})();
