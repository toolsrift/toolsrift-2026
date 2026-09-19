#!/usr/bin/env node
/**
 * scripts/android/listing-frames.js — turn the raw phone captures from
 * screenshots.js into Play Store marketing frames, and render a feature
 * graphic with a phone mockup.
 *
 *   node scripts/android/listing-frames.js            # every site with captures
 *   node scripts/android/listing-frames.js pdf image  # some site ids
 *
 * Reads  android/build/listing/<id>/NN-<page>.png   (1080×1920 raw captures)
 * Writes android/build/listing/<id>/store/NN-<page>.png   (1080×1920 frames)
 *        android/build/listing/<id>/store/feature-graphic.png (1024×500)
 *
 * Each frame: brand background (palette + glow + grid), a headline and a
 * one-line benefit in the brand's fonts, and the capture inside a phone
 * mockup. Fonts load from Google Fonts (CI); offline they fall back.
 * Env: PW_EXECUTABLE_PATH to use a specific Chromium; OFFLINE=1 skips Google Fonts.
 */
const fs = require('fs');
const path = require('path');
const { BRANDS, findBrand } = require('../../lib/sites/brands');

const ROOT = path.join(__dirname, '..', '..');
const LISTING = path.join(ROOT, 'android', 'build', 'listing');

function registry() {
  const src = fs.readFileSync(path.join(ROOT, 'lib', 'toolRegistry.js'), 'utf8');
  return JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('};') + 1));
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// setContent() pages cannot load file:// images, so embed them.
const dataUri = (file) => `data:image/png;base64,${fs.readFileSync(file).toString('base64')}`;
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s);

// Copy for each frame: the home frame sells the site, tool frames sell a tool.
// No "free" / "best" / "#1": Play excludes listings with promotional words in
// graphics or short descriptions from featuring and recommendations.
function copyFor(b, page, tools, index) {
  if (page === 'home') {
    return { kicker: `${tools.length} TOOLS · NO SIGN-UP · OFFLINE`, headline: b.concept.headline, sub: clip(b.concept.sub, 110) };
  }
  const t = tools.find(x => x.id === page);
  const kickers = ['INSTANT · PRIVATE', 'RUNS ON YOUR DEVICE', 'NO UPLOADS, EVER', 'WORKS OFFLINE'];
  return {
    kicker: kickers[index % kickers.length],
    headline: t ? t.name : page.replace(/-/g, ' '),
    sub: t ? clip(t.desc.replace(/\s+/g, ' '), 110) : '',
  };
}

function frameHtml(b, capture, copy, index) {
  const { bg, surface, primary, accent2 } = b.palette;
  const fontsLink = process.env.OFFLINE ? '' : `<link href="https://fonts.googleapis.com/css2?family=${b.fonts.google}&display=swap" rel="stylesheet">`;
  const tilt = index === 0 ? 0 : (index % 2 ? -3 : 3);
  const glowSide = index % 2 ? '85%' : '15%';
  return `<!doctype html><html><head><meta charset="utf-8">${fontsLink}<style>
  html,body{margin:0;width:1080px;height:1920px;overflow:hidden;background:${bg}}
  .bg{position:absolute;inset:0;background:
      radial-gradient(900px 700px at ${glowSide} 12%, ${primary}55, transparent 70%),
      radial-gradient(700px 600px at 50% 105%, ${accent2}33, transparent 70%),
      linear-gradient(160deg, ${bg} 0%, ${surface} 100%)}
  .grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);background-size:60px 60px}
  .top{position:absolute;left:72px;right:72px;top:96px;color:#F8FAFC}
  .brand{display:flex;align-items:center;gap:18px;font:700 30px ${b.fonts.body};letter-spacing:-.3px;color:#E2E8F0}
  .brand img{width:56px;height:56px;border-radius:14px}
  .brand b{color:${primary}}
  .kicker{margin-top:70px;display:inline-block;padding:12px 22px;border-radius:999px;border:2px solid ${primary}88;background:${primary}22;color:${accent2};font:700 22px ${b.fonts.body};letter-spacing:3px}
  h1{margin:34px 0 0;font:800 ${copy.headline.length > 26 ? 76 : 88}px/1.05 ${b.fonts.head};letter-spacing:-2px}
  p{margin:26px 0 0;font:500 34px/1.35 ${b.fonts.body};color:#CBD5E1;max-width:900px}
  .phone{position:absolute;left:50%;top:${copy.sub ? 760 : 700}px;width:820px;height:1700px;margin-left:-410px;transform:rotate(${tilt}deg);border-radius:72px;background:#0b0b0d;padding:16px;box-shadow:0 60px 120px rgba(0,0,0,.6),0 0 0 2px rgba(255,255,255,.08),0 0 140px ${primary}55}
  .screen{width:100%;height:100%;border-radius:58px;overflow:hidden;background:${bg}}
  .screen img{display:block;width:100%}
  .bar{position:absolute;left:0;right:0;bottom:0;height:14px;background:${primary}}
  </style></head><body>
  <div class="bg"></div><div class="grid"></div>
  <div class="top">
    <div class="brand"><img src="${dataUri(path.join(ROOT, 'public', 'brands', b.id, 'icon-192.png'))}"><span>${esc(b.wordmark[0])} <b>${esc(b.wordmark[1])}</b></span></div>
    <div class="kicker">${esc(copy.kicker)}</div>
    <h1>${esc(copy.headline)}</h1>
    ${copy.sub ? `<p>${esc(copy.sub)}</p>` : ''}
  </div>
  <div class="phone"><div class="screen"><img src="${dataUri(capture)}"></div></div>
  <div class="bar"></div>
  </body></html>`;
}

function featureHtml(b, capture, toolCount) {
  const { bg, surface, primary, accent2 } = b.palette;
  const fontsLink = process.env.OFFLINE ? '' : `<link href="https://fonts.googleapis.com/css2?family=${b.fonts.google}&display=swap" rel="stylesheet">`;
  return `<!doctype html><html><head><meta charset="utf-8">${fontsLink}<style>
  html,body{margin:0;width:1024px;height:500px;overflow:hidden;background:${bg}}
  .bg{position:absolute;inset:0;background:radial-gradient(600px 420px at 88% 10%, ${primary}66, transparent 70%),radial-gradient(500px 400px at 5% 100%, ${accent2}33, transparent 70%),linear-gradient(160deg, ${bg} 0%, ${surface} 100%)}
  .grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);background-size:44px 44px}
  .txt{position:absolute;left:64px;top:64px;width:600px;color:#F8FAFC}
  .brand{display:flex;align-items:center;gap:14px;font:700 26px ${b.fonts.body};color:#E2E8F0}.brand img{width:44px;height:44px;border-radius:11px}.brand b{color:${primary}}
  h1{margin:34px 0 0;font:800 ${b.concept.headline.length > 30 ? 44 : 52}px/1.05 ${b.fonts.head};letter-spacing:-1.5px}
  p{margin:18px 0 0;font:500 22px/1.3 ${b.fonts.body};color:#CBD5E1}
  .chips{margin-top:26px;display:flex;gap:12px}.chips span{padding:9px 18px;border-radius:999px;border:2px solid ${primary}77;background:${primary}22;color:${accent2};font:700 16px ${b.fonts.body};letter-spacing:1px}
  .phone{position:absolute;left:700px;top:56px;width:300px;height:620px;transform:rotate(-8deg);border-radius:40px;background:#0b0b0d;padding:9px;box-shadow:0 40px 80px rgba(0,0,0,.6),0 0 0 2px rgba(255,255,255,.08),0 0 90px ${primary}66}
  .screen{width:100%;height:100%;border-radius:32px;overflow:hidden;background:${bg}}.screen img{display:block;width:100%}
  .bar{position:absolute;left:0;right:0;bottom:0;height:8px;background:${primary}}
  </style></head><body><div class="bg"></div><div class="grid"></div>
  <div class="txt"><div class="brand"><img src="${dataUri(path.join(ROOT, 'public', 'brands', b.id, 'icon-192.png'))}"><span>${esc(b.wordmark[0])} <b>${esc(b.wordmark[1])}</b></span></div>
  <h1>${esc(b.concept.headline)}</h1><p>${esc(`${toolCount} ${b.wordmark[1].toLowerCase()} tools · 100% on your device · no sign-up`)}</p>
  <div class="chips"><span>NO SIGN-UP</span><span>NO UPLOADS</span><span>WORKS OFFLINE</span></div></div>
  <div class="phone"><div class="screen"><img src="${dataUri(capture)}"></div></div><div class="bar"></div></body></html>`;
}

async function main() {
  const { chromium } = require('playwright');
  const reg = registry();
  const ids = process.argv.slice(2).map(findBrand).filter(Boolean).map(b => b.id);
  const brands = (ids.length ? BRANDS.filter(b => ids.includes(b.id)) : BRANDS)
    .filter(b => fs.existsSync(path.join(LISTING, b.id)));
  const browser = await chromium.launch({ executablePath: process.env.PW_EXECUTABLE_PATH || undefined, args: ['--no-sandbox', '--disable-gpu'] });
  let n = 0;
  for (const b of brands) {
    const dir = path.join(LISTING, b.id);
    const out = path.join(dir, 'store');
    fs.mkdirSync(out, { recursive: true });
    const tools = (reg[b.slug] || { tools: [] }).tools;
    const captures = fs.readdirSync(dir).filter(f => /^\d\d-.*\.png$/.test(f)).sort();
    if (!captures.length) { console.log(`── ${b.id}: no captures`); continue; }
    console.log(`══ ${b.id}`);
    for (const [i, file] of captures.entries()) {
      const page = file.replace(/^\d\d-/, '').replace(/\.png$/, '');
      const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
      const p = await ctx.newPage();
      await p.setContent(frameHtml(b, path.join(dir, file), copyFor(b, page, tools, i), i), { waitUntil: 'networkidle' });
      await p.evaluate(() => document.fonts.ready);
      await p.screenshot({ path: path.join(out, file) });
      await ctx.close();
      n++;
      console.log(`   ✓ store/${file}`);
    }
    const home = captures.find(f => /-home\.png$/.test(f)) || captures[0];
    const ctx = await browser.newContext({ viewport: { width: 1024, height: 500 }, deviceScaleFactor: 1 });
    const p = await ctx.newPage();
    await p.setContent(featureHtml(b, path.join(dir, home), tools.length), { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(out, 'feature-graphic.png') });
    await ctx.close();
    console.log('   ✓ store/feature-graphic.png');
  }
  await browser.close();
  console.log(`\n${n} store frames written`);
}

main().catch(e => { console.error(e); process.exit(1); });
