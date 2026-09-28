#!/usr/bin/env node
// Fetches what Google fetches from every live network site, as Googlebot:
// robots.txt, sitemap.xml, and every <loc> in the sitemap. Built to settle
// Search Console's "Sitemap could not be read" (pdf, json, colors, content),
// which the code alone could not explain: the route builds valid XML locally.
//
//   node scripts/sites/check-live.js            all live sites + the hub index
//   node scripts/sites/check-live.js pdf json   just these sites (id, slug or subdomain)
//
// Exit code 1 when any robots.txt or sitemap is unreadable, or any sitemap
// URL does not answer 200 directly (a redirect or error in a sitemap is a
// defect Google reports). Needs outbound HTTPS (CI runners have it).
const { BRANDS } = require('../../lib/sites/brands');

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
    // A sitemap may only list URLs on its own host; the hub's index is the
    // one exception (its children are the network sites' sitemaps).
    if (!isIndex && host !== domain) problems.push(`off-host URL in sitemap: ${loc}`);
    const r = await get(loc, isIndex ? 'GET' : 'HEAD');
    if (r.status !== 200) problems.push(`${loc} answered ${r.status || r.error}${r.location ? ` -> ${r.location}` : ''}`);
  }
  return { domain, problems, lines };
}

(async () => {
  const want = process.argv.slice(2);
  // A site may be named by brand id, category slug or subdomain: the JSON
  // site is id "code", slug "json", host json.toolsrift.com.
  const names = b => [b.id, b.slug, b.domain.split('.')[0]];
  const unknown = want.filter(w => !BRANDS.some(b => names(b).includes(w)));
  if (unknown.length) {
    console.error(`Unknown site: ${unknown.join(', ')} (see npm run sites:list)`);
    process.exit(2);
  }
  const sites = BRANDS.filter(b => b.live && (!want.length || names(b).some(n => want.includes(n))));
  const domains = sites.map(b => b.domain);
  if (!want.length) domains.unshift('toolsrift.com');

  let bad = 0;
  for (const domain of domains) {
    const { problems, lines } = await checkSite(domain);
    console.log(`${problems.length ? 'FAIL' : 'ok  '}  ${domain}`);
    lines.forEach(l => console.log(l));
    problems.forEach(p => console.log(`  ! ${p}`));
    if (problems.length) bad++;
  }
  console.log(`\n${domains.length - bad}/${domains.length} sites readable with every sitemap URL answering 200.`);
  process.exitCode = bad ? 1 : 0;
})();
