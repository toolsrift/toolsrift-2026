#!/usr/bin/env node
/**
 * scripts/vercel/bootstrap.js — create the Vercel project for one network site
 * (or all of them). Cross-platform (Windows PowerShell / CMD / macOS / Linux);
 * the same steps as bootstrap.sh.
 *
 *   npm run vercel:bootstrap -- pdf        one site
 *   npm run vercel:bootstrap -- --all      every site in lib/sites/brands.js
 *
 * For each site it:
 *   1. creates the project  "toolsrift-<id>"          (vercel projects add)
 *   2. links this checkout to it                      (vercel link)
 *   3. connects the project to this git remote        (vercel git connect)
 *   4. sets NEXT_PUBLIC_SITE_ID=<id> for prod/preview/dev (vercel env add)
 *   5. attaches <domain> and www.<domain>             (vercel domains add)
 *
 * Prerequisites: `npx vercel login` once. Set VERCEL_TEAM=toolsrifts-projects
 * (or your team slug) so projects land in the team, not your personal scope.
 * Idempotent — safe to re-run; failures on individual steps are reported and
 * the run continues with the next site.
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { BRANDS, findBrand } = require('../../lib/sites/brands');

const ROOT = path.join(__dirname, '..', '..');
const TEAM = process.env.VERCEL_TEAM || '';
const scope = TEAM ? ['--scope', TEAM] : [];
const isWin = process.platform === 'win32';

function vercel(args, { input, quiet = false } = {}) {
  const r = spawnSync(isWin ? 'npx.cmd' : 'npx', ['vercel', ...args, ...scope], {
    cwd: ROOT,
    input,
    encoding: 'utf8',
    shell: isWin,
    stdio: quiet ? ['pipe', 'pipe', 'pipe'] : ['pipe', 'inherit', 'inherit'],
  });
  return r.status === 0;
}

function bootstrap(b) {
  const project = `toolsrift-${b.id}`;
  console.log(`\n══ ${project}  (${b.domain})`);

  vercel(['projects', 'add', project], { quiet: true }); // exists already → fine
  if (!vercel(['link', '--yes', '--project', project], { quiet: true })) {
    console.log(`   ✗ could not link ${project} — is the CLI logged in and VERCEL_TEAM correct?`);
    return false;
  }
  if (!vercel(['git', 'connect', '--yes'], { quiet: true })) {
    console.log('   (git connect skipped — connect in the dashboard: Settings → Git)');
  }
  for (const env of ['production', 'preview', 'development']) {
    vercel(['env', 'rm', 'NEXT_PUBLIC_SITE_ID', env, '--yes'], { quiet: true });
    if (!vercel(['env', 'add', 'NEXT_PUBLIC_SITE_ID', env], { input: b.id, quiet: true })) {
      console.log(`   ✗ env add failed for ${env}`);
    }
  }
  // A subdomain (pdf.toolsrift.com) gets no "www."; an apex domain does.
  const isApex = b.domain.split('.').length === 2;
  for (const d of isApex ? [b.domain, `www.${b.domain}`] : [b.domain]) {
    if (!vercel(['domains', 'add', d, project], { quiet: true })) {
      console.log(`   (domain ${d} not added — if it is still on the hub project, remove it there first, then re-run)`);
    }
  }
  try { fs.rmSync(path.join(ROOT, '.vercel'), { recursive: true, force: true }); } catch (_) { /* ignore */ }
  console.log(`   ✓ project=${project}  NEXT_PUBLIC_SITE_ID=${b.id}  domain=${b.domain}`);
  return true;
}

const arg = process.argv[2];
if (!arg) {
  console.error('usage: node scripts/vercel/bootstrap.js <site-id> | --all');
  process.exit(2);
}
const targets = arg === '--all' ? BRANDS : [findBrand(arg)].filter(Boolean);
if (!targets.length) {
  console.error(`Unknown site "${arg}". Known: ${BRANDS.map(b => b.id).join(', ')}`);
  process.exit(2);
}
if (!TEAM) console.log('⚠  VERCEL_TEAM is not set — projects will be created in your personal scope.');

let ok = 0;
for (const b of targets) if (bootstrap(b)) ok++;
console.log(`\n${ok}/${targets.length} project(s) bootstrapped.`);
process.exit(ok === targets.length ? 0 : 1);
