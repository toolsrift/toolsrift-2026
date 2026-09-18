#!/usr/bin/env node
/**
 * scripts/vercel/deploy-unlinked.js — production deployments Vercel's git
 * integration does not make for us:
 *
 *   default      the network-site projects that have NO git link (Vercel
 *                allows at most 25 projects per repository; the hub + 24 sites
 *                use that allowance). Runs on every push to main.
 *   --catch-up   additionally every toolsrift-* project (and the hub) whose
 *                latest production deployment is not at the current main
 *                commit — e.g. after Vercel refused deployments for a while
 *                (Hobby plan: 100 deployments/day). Runs on a daily schedule.
 *
 * Deployments are created through the API from the repo's main branch
 * (gitSource + the repo id taken from the hub project), falling back to a
 * Vercel CLI upload of this checkout. See .github/workflows/vercel-deploy-unlinked.yml.
 *
 *   VERCEL_TOKEN=... node scripts/vercel/deploy-unlinked.js               # unlinked projects
 *   VERCEL_TOKEN=... node scripts/vercel/deploy-unlinked.js audio video   # some site ids
 *   VERCEL_TOKEN=... node scripts/vercel/deploy-unlinked.js --catch-up    # everything behind main
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
  const args = process.argv.slice(2);
  const catchUp = args.includes('--catch-up');
  const wanted = args.filter(a => !a.startsWith('--')).map(findBrand).filter(Boolean).map(b => `toolsrift-${b.id}`);
  const hubName = process.env.HUB_PROJECT || 'toolsrift';
  const hub = (all.projects || []).find(p => p.name === hubName);
  // Repo id of the hub project (git-linked): lets Vercel build an UNLINKED
  // project straight from the repo's main branch, no upload needed.
  const repoId = hub && hub.link && hub.link.repoId;
  const ref = process.env.GIT_REF || 'main';
  const headSha = (process.env.GITHUB_SHA || '').toLowerCase();

  const network = (all.projects || []).filter(p => /^toolsrift-/.test(p.name));
  let targets;
  if (catchUp) {
    targets = [];
    for (const p of [...network, ...(hub ? [hub] : [])]) {
      const deps = (await api(`/v6/deployments?projectId=${p.id}&target=production&limit=1&teamId=${team.id}`)).deployments || [];
      const d = deps[0];
      const sha = d && d.meta && (d.meta.githubCommitSha || '').toLowerCase();
      const state = d && (d.state || d.readyState);
      const behind = !d || (headSha && sha && sha !== headSha) || state === 'ERROR' || state === 'CANCELED';
      if (behind) targets.push(p);
      else console.log(`   ${p.name}: up to date (${state} @ ${(sha || '').slice(0, 7)})`);
    }
  } else {
    targets = network.filter(p => !p.link && (!wanted.length || wanted.includes(p.name)));
  }
  if (!targets.length) { console.log(catchUp ? 'everything is at main — nothing to deploy' : 'no unlinked toolsrift-* projects — nothing to deploy'); return; }
  console.log(`${catchUp ? 'projects behind main' : 'unlinked projects'}: ${targets.map(p => p.name).join(', ')}`);
  const pause = (ms) => new Promise(r => setTimeout(r, ms));

  let failed = 0;
  for (const p of targets) {
    console.log(`\n══ ${p.name}`);
    await pause(4000); // stay under Vercel's deployments-per-minute flood limit
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
