#!/usr/bin/env node
// ── Publish ToolsRift apps to Google Play (Play Developer API v3) ───────────
//
//   PLAY_SERVICE_ACCOUNT_JSON='…' node scripts/android/publish.js --all
//   node scripts/android/publish.js --sites "code encoders" --tracks internal,alpha
//
// For every app (the Play Console entry must ALREADY exist — the API cannot
// create apps, answer the "Set up your app" questionnaires or assign tester
// lists; those stay manual):
//   1. store listing text (title, short + full description from
//      android/apps/<id>/play-listing.md) and contact details
//   2. graphics: icon, feature graphic, phone / 7" / 10" screenshots from the
//      android-listing artifact (--assets DIR, default android/build/listing)
//   3. the .aab from the android-build artifact (--bundles DIR, default dist),
//      released to every track in --tracks with --notes as release notes
//   4. commit with changesNotSentForReview, so nothing is submitted for review
//      until someone clicks "Send changes for review" in the Console.
//
// Flags: --skip-listing  --skip-images  --skip-bundle  --dry-run
//        --notes "First release."  --assets DIR  --bundles DIR
// Auth:  PLAY_SERVICE_ACCOUNT_JSON (the key file's contents) or
//        PLAY_SERVICE_ACCOUNT_FILE (path). Never commit the key.
//
// No dependencies: the JWT is signed with node:crypto and calls use fetch.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { BRANDS } = require('../../lib/sites/brands');

const ROOT = path.resolve(__dirname, '..', '..');
const API = 'https://androidpublisher.googleapis.com';
const SCOPE = 'https://www.googleapis.com/auth/androidpublisher';
const IMAGE_TYPES = { icon: 'icon', feature: 'featureGraphic', phone: 'phoneScreenshots', seven: 'sevenInchScreenshots', ten: 'tenInchScreenshots' };

// ── args ───────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const opt = (name, def) => { const i = argv.indexOf(name); return i >= 0 && argv[i + 1] != null ? argv[i + 1] : def; };
const OPTS = {
  all: flag('--all'),
  sites: (opt('--sites', '') || '').split(/[\s,]+/).filter(Boolean),
  tracks: (opt('--tracks', 'internal,alpha') || '').split(/[\s,]+/).filter(Boolean),
  notes: opt('--notes', 'First release.'),
  assets: path.resolve(opt('--assets', path.join(ROOT, 'android', 'build', 'listing'))),
  bundles: path.resolve(opt('--bundles', path.join(ROOT, 'dist'))),
  skipListing: flag('--skip-listing'),
  skipImages: flag('--skip-images'),
  skipBundle: flag('--skip-bundle'),
  dryRun: flag('--dry-run'),
};
if (!OPTS.all && !OPTS.sites.length) {
  console.error('usage: publish.js (--all | --sites "id id …") [--tracks internal,alpha] [--notes …] [--assets DIR] [--bundles DIR] [--skip-listing] [--skip-images] [--skip-bundle] [--dry-run]');
  process.exit(2);
}

// ── auth ───────────────────────────────────────────────────────────────────
function loadServiceAccount() {
  const raw = process.env.PLAY_SERVICE_ACCOUNT_JSON
    || (process.env.PLAY_SERVICE_ACCOUNT_FILE && fs.readFileSync(process.env.PLAY_SERVICE_ACCOUNT_FILE, 'utf8'));
  if (!raw) throw new Error('PLAY_SERVICE_ACCOUNT_JSON (or PLAY_SERVICE_ACCOUNT_FILE) is not set');
  const sa = JSON.parse(raw);
  if (!sa.client_email || !sa.private_key) throw new Error('service account JSON is missing client_email / private_key');
  return sa;
}

let TOKEN = null;
async function accessToken() {
  if (TOKEN && TOKEN.exp > Date.now() + 60000) return TOKEN.value;
  const sa = loadServiceAccount();
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({ iss: sa.client_email, scope: SCOPE, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })}`;
  const sig = crypto.createSign('RSA-SHA256').update(unsigned).sign(sa.private_key).toString('base64url');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${sig}` }),
  });
  const json = await res.json();
  if (!res.ok || !json.access_token) throw new Error(`token exchange failed: ${res.status} ${JSON.stringify(json)}`);
  TOKEN = { value: json.access_token, exp: Date.now() + (json.expires_in || 3600) * 1000 };
  return TOKEN.value;
}

class ApiError extends Error { constructor(status, body) { super(`${status} ${typeof body === 'string' ? body : JSON.stringify(body)}`); this.status = status; this.body = body; } }

async function api(method, url, { json, bytes, contentType } = {}) {
  const headers = { authorization: `Bearer ${await accessToken()}` };
  let body;
  if (json !== undefined) { headers['content-type'] = 'application/json'; body = JSON.stringify(json); }
  if (bytes) { headers['content-type'] = contentType || 'application/octet-stream'; body = bytes; }
  const res = await fetch(url.startsWith('http') ? url : `${API}${url}`, { method, headers, body });
  const text = await res.text();
  let parsed = text; try { parsed = text ? JSON.parse(text) : null; } catch (_) { /* plain text */ }
  if (!res.ok) throw new ApiError(res.status, parsed);
  return parsed;
}
const errText = (e) => (e && e.body && e.body.error && e.body.error.message) || (e && e.message) || String(e);

// ── inputs per app ─────────────────────────────────────────────────────────
function parseListing(id) {
  const file = path.join(ROOT, 'android', 'apps', id, 'play-listing.md');
  const md = fs.readFileSync(file, 'utf8');
  const row = (label) => { const m = md.match(new RegExp(`^\\| ${label}[^|]*\\| (.+?) \\|$`, 'm')); return m ? m[1].replace(/`/g, '').trim() : ''; };
  const section = (heading) => {
    const m = md.match(new RegExp(`^## ${heading}[^\\n]*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm'));
    return m ? m[1].trim() : '';
  };
  const title = row('App name');
  const short = section('Short description');
  const full = section('Full description');
  if (!title || !short || !full) throw new Error(`could not parse ${path.relative(ROOT, file)}`);
  if (title.length > 30 || short.length > 80 || full.length > 4000) throw new Error(`${id}: listing text over Play limits (title ${title.length}/30, short ${short.length}/80, full ${full.length}/4000)`);
  return { title, short, full, website: row('Website'), email: row('Support email') || 'contact@toolsrift.com' };
}

function findImages(id) {
  const dir = path.join(OPTS.assets, id);
  const pick = (candidates) => candidates.find(f => f && fs.existsSync(f)) || null;
  const icon = pick([path.join(dir, 'icon-512.png'), path.join(ROOT, 'public', 'brands', id, 'icon-512.png')]);
  const feature = pick([path.join(dir, 'feature-graphic.png'), path.join(ROOT, 'android', 'apps', id, 'feature-graphic.png')]);
  const shots = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter(f => /^\d{2}-.+\.png$/i.test(f)).sort().slice(0, 8).map(f => path.join(dir, f))
    : [];
  return { icon, feature, shots };
}

function findBundle(pkg) {
  if (!fs.existsSync(OPTS.bundles)) return null;
  const hits = [];
  const walk = (d, depth) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory() && depth < 4) walk(p, depth + 1);
      else if (e.isFile() && e.name.startsWith(`${pkg}-`) && e.name.endsWith('.aab')) hits.push(p);
    }
  };
  walk(OPTS.bundles, 0);
  if (!hits.length) return null;
  hits.sort();
  const file = hits[hits.length - 1]; // newest version name sorts last
  let versionCode = null;
  const manifest = path.join(path.dirname(file), 'twa-manifest.json');
  try { versionCode = JSON.parse(fs.readFileSync(manifest, 'utf8')).appVersionCode || null; } catch (_) { /* optional */ }
  const versionName = path.basename(file).slice(pkg.length + 1, -4);
  return { file, versionCode, versionName };
}

// ── one app ────────────────────────────────────────────────────────────────
async function publishApp(b, report, { draft = false } = {}) {
  const id = b.id, pkg = b.android.packageId;
  const log = (m) => console.log(`  ${m}`);
  console.log(`\n▶ ${id}  (${pkg})${draft ? '  [draft releases]' : ''}`);

  const listing = OPTS.skipListing ? null : parseListing(id);
  const images = OPTS.skipImages ? null : findImages(id);
  const bundle = OPTS.skipBundle ? null : findBundle(pkg);

  if (listing) log(`listing: "${listing.title}" · short ${listing.short.length} chars · full ${listing.full.length} chars`);
  if (images) log(`images: icon ${images.icon ? '✓' : '✗'} · feature ${images.feature ? '✓' : '✗'} · screenshots ${images.shots.length}`);
  if (!OPTS.skipBundle) log(bundle ? `bundle: ${path.relative(process.cwd(), bundle.file)} (versionCode ${bundle.versionCode || '?'})` : 'bundle: none found');
  // No bundle for this app in the artifact (e.g. a run that only built some
  // sites): still refresh the listing; releases need a bundle.
  const noBundle = !OPTS.skipBundle && !bundle;
  if (noBundle && !listing && !images) { report.push({ id, pkg, status: 'skipped', note: 'no .aab in --bundles dir' }); return; }
  if (noBundle) log('⚠ no bundle — listing only (releases skipped)');
  if (OPTS.dryRun) { report.push({ id, pkg, status: 'dry-run' }); return; }

  const base = `/androidpublisher/v3/applications/${pkg}/edits`;
  let edit;
  try { edit = await api('POST', base, { json: {} }); }
  catch (e) {
    if (e.status === 404 || e.status === 403) { log(`✗ not found in Play Console (create the app first, and give the service account access) — ${errText(e)}`); report.push({ id, pkg, status: 'not in Console' }); return; }
    throw e;
  }
  const E = `${base}/${edit.id}`;
  const notes = [];

  if (listing) {
    await api('PUT', `${E}/listings/en-US`, { json: { language: 'en-US', title: listing.title, shortDescription: listing.short, fullDescription: listing.full } });
    await api('PATCH', `${E}/details`, { json: { defaultLanguage: 'en-US', contactEmail: listing.email, contactWebsite: listing.website } });
    log('listing text + contact details set');
    notes.push('listing');
  }

  if (images) {
    const upload = async (type, files) => {
      if (!files.length) return;
      await api('DELETE', `${E}/listings/en-US/${type}`);
      for (const f of files) {
        await api('POST', `${API}/upload/androidpublisher/v3/applications/${pkg}/edits/${edit.id}/listings/en-US/${type}?uploadType=media`, { bytes: fs.readFileSync(f), contentType: 'image/png' });
      }
      log(`${type}: ${files.length} uploaded`);
    };
    await upload(IMAGE_TYPES.icon, images.icon ? [images.icon] : []);
    await upload(IMAGE_TYPES.feature, images.feature ? [images.feature] : []);
    await upload(IMAGE_TYPES.phone, images.shots);
    await upload(IMAGE_TYPES.seven, images.shots);
    await upload(IMAGE_TYPES.ten, images.shots);
    notes.push(`${images.shots.length} screenshots`);
  }

  let versionCode = null;
  if (bundle) {
    try {
      const r = await api('POST', `${API}/upload/androidpublisher/v3/applications/${pkg}/edits/${edit.id}/bundles?uploadType=media`, { bytes: fs.readFileSync(bundle.file) });
      versionCode = r.versionCode;
      log(`bundle uploaded → versionCode ${versionCode}`);
    } catch (e) {
      if (/version code .* already been used|already exists/i.test(errText(e)) && bundle.versionCode) {
        versionCode = bundle.versionCode;
        log(`bundle already in Play (versionCode ${versionCode}) — reusing it`);
      } else throw e;
    }
    for (const track of OPTS.tracks) {
      // No countryTargeting: Play only accepts it on staged releases. The
      // track's country availability is set once in the Console instead.
      // An app that has never been published ("draft app") only accepts draft
      // releases: someone then clicks Review release → Start rollout in the
      // Console once. Published apps get completed releases straight away.
      const release = { name: bundle.versionName, versionCodes: [String(versionCode)], status: draft ? 'draft' : 'completed', releaseNotes: [{ language: 'en-US', text: OPTS.notes }] };
      await api('PUT', `${E}/tracks/${track}`, { json: { track, releases: [release] } });
      log(`track ${track}: release ${bundle.versionName} (${release.status})`);
    }
    notes.push(`bundle ${versionCode} → ${OPTS.tracks.join(', ')}${draft ? ' (draft — roll out in the Console)' : ''}`);
  }

  try { await api('POST', `${E}:commit?changesNotSentForReview=true`); }
  catch (e) {
    if (e.status === 400 && /changesNotSentForReview|not sent for review/i.test(errText(e))) await api('POST', `${E}:commit`);
    else if (!draft && /draft app/i.test(errText(e))) {
      // Nothing from this edit was kept (edits are atomic) — redo it with draft releases.
      log('app has never been published — redoing with draft releases');
      return publishApp(b, report, { draft: true });
    }
    else throw e;
  }
  log('✓ committed (not sent for review — click "Send changes for review" in the Console)');
  if (noBundle) notes.push('⚠ no .aab in artifact — no release created');
  report.push({ id, pkg, status: 'ok', note: notes.join(' · ') });
}

// ── main ───────────────────────────────────────────────────────────────────
(async () => {
  const wanted = OPTS.all ? BRANDS : BRANDS.filter(b => OPTS.sites.includes(b.id) || OPTS.sites.includes(b.slug));
  const unknown = OPTS.sites.filter(s => !BRANDS.some(b => b.id === s || b.slug === s));
  if (unknown.length) { console.error(`unknown site(s): ${unknown.join(', ')}`); process.exit(2); }
  if (!OPTS.dryRun) await accessToken(); // fail fast on bad credentials

  const report = [];
  let failed = 0;
  for (const b of wanted) {
    try { await publishApp(b, report); }
    catch (e) { failed++; console.log(`  ✗ ${errText(e)}`); report.push({ id: b.id, pkg: b.android.packageId, status: 'FAILED', note: errText(e).slice(0, 200) }); }
  }

  const md = ['| app | package | result | notes |', '|---|---|---|---|', ...report.map(r => `| ${r.id} | \`${r.pkg}\` | ${r.status} | ${r.note || ''} |`)].join('\n');
  console.log(`\n${md}`);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Google Play publish — ${OPTS.dryRun ? 'dry run' : OPTS.tracks.join(', ')}\n\n${md}\n\nNothing is sent for review by this workflow: open each app's **Publishing overview** in Play Console and click **Send changes for review**. Testers and the "Set up your app" questionnaires are Console-only.\n`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(errText(e)); process.exit(1); });
