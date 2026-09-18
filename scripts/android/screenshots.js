#!/usr/bin/env node
/**
 * scripts/android/screenshots.js — Play Store phone screenshots for every
 * network site's app, taken from the live sites with Playwright.
 *
 *   node scripts/android/screenshots.js              # all 29 sites
 *   node scripts/android/screenshots.js pdf image    # some site ids
 *
 * Output: android/build/listing/<id>/01-home.png, 02-<tool>.png … (1080×1920,
 * portrait 9:16 — what Play Console asks for). Runs in CI via
 * .github/workflows/android-listing.yml, which uploads them as artifacts.
 *
 * Env: BASE_URL_<ID> (e.g. BASE_URL_PDF=http://localhost:3000) to shoot a
 * local build instead of https://<domain>; PW_EXECUTABLE_PATH to use a
 * specific Chromium; SHOTS (default 5) screenshots per app.
 * Needs `npm i playwright` (+ `npx playwright install chromium`).
 */
const fs = require('fs');
const path = require('path');
const { BRANDS, findBrand } = require('../../lib/sites/brands');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(ROOT, 'android', 'build', 'listing');
const SHOTS = Number(process.env.SHOTS || 5);
const UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';

async function main() {
  const { chromium } = require('playwright');
  const ids = process.argv.slice(2).map(findBrand).filter(Boolean).map(b => b.id);
  const brands = ids.length ? BRANDS.filter(b => ids.includes(b.id)) : BRANDS;
  const browser = await chromium.launch({
    executablePath: process.env.PW_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-gpu'],
  });
  let failed = 0;
  for (const b of brands) {
    const base = process.env[`BASE_URL_${b.id.toUpperCase().replace(/-/g, '_')}`] || `https://${b.domain}`;
    const dir = path.join(OUT, b.id);
    fs.mkdirSync(dir, { recursive: true });
    const shortcuts = JSON.parse(fs.readFileSync(path.join(ROOT, 'android', 'apps', b.id, 'shortcuts.json'), 'utf8'));
    const pages = [{ name: 'home', url: '/' }, ...shortcuts.map(s => ({ name: s.url.replace(/^\//, ''), url: s.url }))].slice(0, SHOTS);
    const ctx = await browser.newContext({
      viewport: { width: 540, height: 960 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
      userAgent: UA, colorScheme: 'dark', locale: 'en-US',
    });
    // Pre-accept the cookie banner (components/CookieConsent.jsx) so it does
    // not cover the bottom of every screenshot.
    await ctx.addInitScript(() => { try { localStorage.setItem('tr_cookie_consent', 'accepted'); } catch (_) {} });
    const page = await ctx.newPage();
    let n = 0;
    console.log(`══ ${b.id}  ${base}`);
    for (const p of pages) {
      n++;
      const file = path.join(dir, `${String(n).padStart(2, '0')}-${p.name}.png`);
      try {
        const res = await page.goto(`${base}${p.url}`, { waitUntil: 'networkidle', timeout: 60000 });
        if (!res || res.status() >= 400) throw new Error(`HTTP ${res ? res.status() : 'none'}`);
        // ssr:false tool widgets mount after hydration — give them a moment.
        await page.waitForTimeout(2500);
        await page.screenshot({ path: file, fullPage: false });
        console.log(`   ✓ ${path.relative(ROOT, file)}`);
      } catch (e) {
        failed++;
        console.log(`   ✗ ${p.url}: ${e.message.split('\n')[0]}`);
      }
    }
    await ctx.close();
  }
  await browser.close();
  console.log(failed ? `\n${failed} screenshot(s) failed` : '\nAll screenshots taken');
  process.exit(failed ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
