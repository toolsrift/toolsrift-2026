#!/usr/bin/env node
// Smoke test of a running build (`next start`) — the category sections under
// /<slug>, their manifests, assetlinks, the sitemap, and the 301s from the
// former category subdomains (simulated with a Host header).
//
//   node scripts/sites/smoke.js http://localhost:3123              # hub build
//   node scripts/sites/smoke.js http://localhost:3123 --legacy pdf # a legacy
//        per-category project build (NEXT_PUBLIC_SITE_ID=pdf): must 301 everything
//
// Exit code 1 on the first failed expectation. Used by .github/workflows/build.yml.
const http = require('http');
const { BRANDS, findBrand } = require('../../lib/sites/brands');

const base = new URL(process.argv[2] || 'http://localhost:3000');
const legacyIdx = process.argv.indexOf('--legacy');
const legacy = legacyIdx > 0 ? findBrand(process.argv[legacyIdx + 1]) : null;

function get(path, host) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: base.hostname, port: base.port, path, method: 'GET',
      headers: { Host: host || base.host, 'User-Agent': 'toolsrift-smoke' },
    }, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', c => { body += c; });
      res.on('end', () => resolve({ status: res.statusCode, location: res.headers.location || '', body }));
    });
    req.on('error', reject);
    req.setTimeout(30000, () => req.destroy(new Error(`timeout ${path}`)));
    req.end();
  });
}

let failed = 0;
function expect(name, ok, detail) {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${ok ? '' : `  — ${detail}`}`);
  if (!ok) failed++;
}

async function redirects(path, host, to) {
  const r = await get(path, host);
  expect(`${host || base.host}${path} → ${to}`, r.status === 301 && r.location === to, `${r.status} ${r.location}`);
}

async function hub() {
  const home = await get('/');
  expect('/ answers 200', home.status === 200, home.status);

  for (const b of BRANDS) {
    const r = await get(b.path);
    expect(`${b.path} answers 200 in its brand`,
      r.status === 200 && r.body.includes(`--tr-bg:${b.palette.bg}`) && r.body.includes(`<link rel="canonical" href="https://toolsrift.com${b.path}"`),
      `${r.status}, brand css ${r.body.includes(`--tr-bg:${b.palette.bg}`)}`);
  }

  const tool = await get('/pdf/pdf-merger');
  expect('/pdf/pdf-merger answers 200 as a PDF-section tool page',
    tool.status === 200 && tool.body.includes('href="/pdf/manifest.webmanifest"') && tool.body.includes('https://toolsrift.com/pdf/pdf-merger'),
    tool.status);

  const m = await get('/pdf/manifest.webmanifest');
  let manifest = null;
  try { manifest = JSON.parse(m.body); } catch (_) { /* reported below */ }
  expect('/pdf/manifest.webmanifest is scoped to /pdf/', m.status === 200 && manifest && manifest.scope === '/pdf/' && manifest.start_url.startsWith('/pdf/'), `${m.status} ${m.body.slice(0, 80)}`);

  const al = await get('/.well-known/assetlinks.json');
  expect('assetlinks lists the main app and the PDF app', al.status === 200 && al.body.includes('com.toolsrift.main') && al.body.includes('com.toolsrift.pdf'), al.status);

  const sm = await get('/sitemap.xml');
  expect('sitemap.xml is one urlset with section URLs', sm.status === 200 && sm.body.includes('<urlset') && sm.body.includes('<loc>https://toolsrift.com/pdf</loc>') && !sm.body.includes('.toolsrift.com/'), sm.status);

  // Former category subdomains (host → path).
  await redirects('/', 'pdf.toolsrift.com', 'https://toolsrift.com/pdf');
  await redirects('/pdf-merger', 'pdf.toolsrift.com', 'https://toolsrift.com/pdf/pdf-merger');
  await redirects('/pdf/pdf-merger', 'pdf.toolsrift.com', 'https://toolsrift.com/pdf/pdf-merger');
  await redirects('/json-formatter?x=1', 'json.toolsrift.com', 'https://toolsrift.com/json/json-formatter?x=1');
  await redirects('/privacy-policy', 'content.toolsrift.com', 'https://toolsrift.com/privacy-policy');
  await redirects('/manifest.json', 'image.toolsrift.com', 'https://toolsrift.com/images/manifest.webmanifest');
  await redirects('/sitemap.xml', 'www.video.toolsrift.com', 'https://toolsrift.com/sitemap.xml');
  await redirects('/pdf', 'www.toolsrift.com', 'https://toolsrift.com/pdf');
  const legacyLinks = await get('/.well-known/assetlinks.json', 'pdf.toolsrift.com');
  expect('pdf.toolsrift.com/.well-known/assetlinks.json answers 200 (not redirected)', legacyLinks.status === 200 && legacyLinks.body.includes('com.toolsrift.pdf'), legacyLinks.status);
}

async function legacyBuild(b) {
  await redirects('/', 'localhost', `https://toolsrift.com${b.path}`);
  await redirects('/some-tool', `toolsrift-${b.id}.vercel.app`, `https://toolsrift.com${b.path}/some-tool`);
  const al = await get('/.well-known/assetlinks.json');
  expect('legacy build still serves assetlinks', al.status === 200 && al.body.includes(b.android.packageId), al.status);
}

(async () => {
  if (legacy) await legacyBuild(legacy);
  else await hub();
  console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
