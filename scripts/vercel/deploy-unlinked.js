#!/usr/bin/env node
/**
 * scripts/vercel/deploy-unlinked.js — deploy the network-site projects that
 * have NO Git link (Vercel allows at most 25 projects per repository; the
 * hub + 24 sites use that allowance) by uploading this checkout with the
 * Vercel CLI. Runs on every push to main via
 * .github/workflows/vercel-deploy-unlinked.yml.
 *
 *   VERCEL_TOKEN=... node scripts/vercel/deploy-unlinked.js          # all unlinked toolsrift-* projects
 *   VERCEL_TOKEN=... node scripts/vercel/deploy-unlinked.js audio    # one site id
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { BRANDS, findBrand } = require('../../lib/sites/brands');

const TOKEN = process.env.VERCEL_TOKEN;
const TEAM_SLUG = process.env.VERCEL_TEAM || 'toolsrifts-projects';
const ROOT = path.join(__dirname, '..', '..');
if (!TOKEN) { console.error('VERCEL_TOKEN is required'); process.exit(2); }

async function api(pathname, method = 'GET', body) {
  const res = await fetch(`https://api.vercel.com${pathname}`, {
    method, headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`${method} ${pathname} → ${(data && data.error && data.error.message) || res.status}`);
  return data;
}

function vercel(args) {
  return spawnSync('npx', ['vercel', ...args, '--token', TOKEN, '--scope', TEAM_SLUG], { cwd: ROOT, encoding: 'utf8' });
}

async function main() {
  const team = await api(`/v2/teams?slug=${encodeURIComponent(TEAM_SLUG)}`);
  const all = await api(`/v9/projects?teamId=${team.id}&limit=100`);
  const wanted = process.argv.slice(2).map(findBrand).filter(Boolean).map(b => `toolsrift-${b.id}`);
  const targets = (all.projects || []).filter(p =>
    /^toolsrift-/.test(p.name) && !p.link && (!wanted.length || wanted.includes(p.name))
  );
  if (!targets.length) { console.log('no unlinked toolsrift-* projects — nothing to deploy'); return; }
  console.log(`unlinked projects: ${targets.map(p => p.name).join(', ')}`);

  // Repo id of the hub project (git-linked): lets Vercel build an UNLINKED
  // project straight from the repo's main branch, no upload needed.
  const hub = (all.projects || []).find(p => p.name === (process.env.HUB_PROJECT || 'toolsrift'));
  const repoId = hub && hub.link && hub.link.repoId;
  const ref = process.env.GIT_REF || 'main';

  let failed = 0;
  for (const p of targets) {
    console.log(`\n══ ${p.name}`);
    if (repoId) {
      try {
        const d = await api(`/v13/deployments?forceNew=1&teamId=${team.id}`, 'POST', {
          name: p.name, project: p.id, target: 'production', gitSource: { type: 'github', repoId, ref },
        });
        console.log(`   ✓ git-source deployment → https://${d.url}`);
        continue;
      } catch (e) {
        console.log(`   (git-source deploy refused: ${e.message} — trying CLI upload)`);
      }
    }
    const link = vercel(['link', '--yes', '--project', p.name]);
    if (link.status !== 0) { console.log(`   ✗ link: ${(link.stderr || '').trim().split('\n').pop()}`); failed++; continue; }
    const dep = vercel(['deploy', '--prod', '--yes', '--no-wait']);
    try { fs.rmSync(path.join(ROOT, '.vercel'), { recursive: true, force: true }); } catch (_) { /* ignore */ }
    if (dep.status !== 0) { console.log(`   ✗ deploy:\n${(dep.stderr || dep.stdout || '').trim().split('\n').slice(-12).map(l => '      ' + l).join('\n')}`); failed++; continue; }
    console.log(`   ✓ ${(dep.stdout || '').trim().split('\n').pop()}`);
  }
  process.exit(failed ? 1 : 0);
}

main().catch(e => { console.error(e.message); process.exit(1); });
