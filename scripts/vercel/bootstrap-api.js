#!/usr/bin/env node
/**
 * scripts/vercel/bootstrap-api.js — create / configure the Vercel project for
 * every network site through the Vercel REST API (no CLI, no browser).
 *
 *   VERCEL_TOKEN=... node scripts/vercel/bootstrap-api.js --all
 *   VERCEL_TOKEN=... node scripts/vercel/bootstrap-api.js pdf image
 *
 * Env:
 *   VERCEL_TOKEN        required — a token created at vercel.com/account/tokens
 *                       with access to the team below
 *   VERCEL_TEAM         team slug (default "toolsrifts-projects")
 *   GIT_REPO            "owner/name" linked to each project
 *                       (default "toolsrift/toolsrift-2026")
 *   MOVE_DOMAINS=1      if a site's subdomain is attached to the hub project,
 *                       detach it there first (pdf./text./image./dev./calc.)
 *   DEPLOY=1            trigger a production deployment of each project from
 *                       the repo's main branch after configuring it
 *   HUB_PROJECT         name of the hub project (default "toolsrift")
 *
 * Per site it: creates "toolsrift-<id>" linked to the repo (or reuses it),
 * sets NEXT_PUBLIC_SITE_ID=<id> for all environments, attaches
 * <category>.toolsrift.com, optionally deploys. Idempotent.
 *
 * Runs in CI via .github/workflows/vercel-bootstrap.yml.
 */
const { BRANDS, findBrand } = require('../../lib/sites/brands');

const TOKEN = process.env.VERCEL_TOKEN;
const TEAM_SLUG = process.env.VERCEL_TEAM || 'toolsrifts-projects';
const REPO = process.env.GIT_REPO || 'toolsrift/toolsrift-2026';
const HUB_PROJECT = process.env.HUB_PROJECT || 'toolsrift';
const MOVE_DOMAINS = process.env.MOVE_DOMAINS === '1';
const DEPLOY = process.env.DEPLOY === '1';
const API = 'https://api.vercel.com';

if (!TOKEN) {
  console.error('VERCEL_TOKEN is required');
  process.exit(2);
}

let teamId = null;

async function api(method, path, body) {
  const url = new URL(API + path);
  if (teamId && !url.searchParams.has('teamId')) url.searchParams.set('teamId', teamId);
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch (_) { /* no body */ }
  if (!res.ok) {
    const msg = (data && data.error && (data.error.message || data.error.code)) || `${res.status} ${res.statusText}`;
    const err = new Error(`${method} ${path} → ${msg}`);
    err.status = res.status;
    err.code = data && data.error && data.error.code;
    throw err;
  }
  return data;
}

async function resolveTeam() {
  const t = await api('GET', `/v2/teams?slug=${encodeURIComponent(TEAM_SLUG)}`);
  if (!t || !t.id) throw new Error(`team "${TEAM_SLUG}" not found for this token`);
  teamId = t.id;
  console.log(`team: ${t.name || TEAM_SLUG} (${teamId})`);
}

async function getProject(name) {
  try { return await api('GET', `/v9/projects/${encodeURIComponent(name)}`); }
  catch (e) { if (e.status === 404) return null; throw e; }
}

async function ensureProject(b) {
  const name = `toolsrift-${b.id}`;
  let p = await getProject(name);
  if (p) {
    console.log(`   project exists (${p.id})${p.link ? ', git-linked' : ', NOT git-linked'}`);
    if (!p.link) {
      // Link the repo after the fact — unless the repo already has its 25 projects.
      try {
        await api('POST', `/v9/projects/${p.id}/link`, { type: 'github', repo: REPO });
        console.log('   linked to git');
        p = await getProject(name);
      } catch (e) {
        if (!/more than 25 Projects/i.test(e.message)) throw e;
        console.log('   stays unlinked (25-projects-per-repo limit) — deployed by CI via Vercel CLI');
      }
    }
    return p;
  }
  const env = [
    { key: 'NEXT_PUBLIC_SITE_ID', value: b.id, target: ['production', 'preview', 'development'], type: 'plain' },
  ];
  try {
    p = await api('POST', '/v10/projects', {
      name, framework: 'nextjs', gitRepository: { type: 'github', repo: REPO }, environmentVariables: env,
    });
    console.log(`   created project ${p.id}, linked to ${REPO}`);
    return p;
  } catch (e) {
    // Vercel allows at most 25 projects per Git repository. Beyond that, create
    // the project WITHOUT a Git link; .github/workflows/vercel-deploy-unlinked.yml
    // deploys such projects with the Vercel CLI on every push to main.
    if (!/more than 25 Projects/i.test(e.message)) throw e;
    p = await api('POST', '/v10/projects', { name, framework: 'nextjs', environmentVariables: env });
    console.log(`   created project ${p.id} WITHOUT git link (25-projects-per-repo limit) — deployed by CI via Vercel CLI`);
    return p;
  }
}

async function ensureEnv(p, b) {
  const list = await api('GET', `/v9/projects/${p.id}/env`);
  const existing = (list.envs || []).filter(e => e.key === 'NEXT_PUBLIC_SITE_ID');
  const ok = existing.some(e => e.value === b.id && ['production', 'preview', 'development'].every(t => (e.target || []).includes(t)));
  if (ok) return;
  for (const e of existing) await api('DELETE', `/v9/projects/${p.id}/env/${e.id}`);
  await api('POST', `/v10/projects/${p.id}/env?upsert=true`, {
    key: 'NEXT_PUBLIC_SITE_ID', value: b.id, type: 'plain', target: ['production', 'preview', 'development'],
  });
  console.log(`   NEXT_PUBLIC_SITE_ID=${b.id} (all environments)`);
}

async function ensureDomain(p, b) {
  const cur = await api('GET', `/v9/projects/${p.id}/domains`);
  if ((cur.domains || []).some(d => d.name === b.domain)) {
    console.log(`   domain ${b.domain} already attached`);
    return true;
  }
  try {
    await api('POST', `/v10/projects/${p.id}/domains`, { name: b.domain });
    console.log(`   attached ${b.domain}`);
    return true;
  } catch (e) {
    // Attached to another project (the hub's legacy mirrors) → move it if allowed.
    if (MOVE_DOMAINS && /already|in use|another project|domain_already|conflict/i.test(e.message)) {
      const hub = await getProject(HUB_PROJECT);
      if (hub) {
        try {
          await api('DELETE', `/v9/projects/${hub.id}/domains/${encodeURIComponent(b.domain)}`);
          console.log(`   detached ${b.domain} from ${HUB_PROJECT}`);
          await api('POST', `/v10/projects/${p.id}/domains`, { name: b.domain });
          console.log(`   attached ${b.domain}`);
          return true;
        } catch (e2) {
          console.log(`   ✗ could not move ${b.domain}: ${e2.message}`);
          return false;
        }
      }
    }
    console.log(`   ✗ could not attach ${b.domain}: ${e.message}${MOVE_DOMAINS ? '' : ' (set MOVE_DOMAINS=1 to detach it from the hub first)'}`);
    return false;
  }
}

async function deploy(p) {
  if (!DEPLOY) return;
  const repoId = p.link && p.link.repoId;
  if (!repoId) {
    // Unlinked project: build + deploy this checkout with the Vercel CLI.
    const { spawnSync } = require('child_process');
    const fs = require('fs');
    const path = require('path');
    const root = path.join(__dirname, '..', '..');
    const run = (args) => spawnSync('npx', ['vercel', ...args, '--token', TOKEN, '--scope', TEAM_SLUG], { cwd: root, encoding: 'utf8' });
    const link = run(['link', '--yes', '--project', p.name]);
    if (link.status !== 0) { console.log(`   ✗ vercel link failed: ${(link.stderr || '').trim().split('\n').pop()}`); return; }
    const dep = run(['deploy', '--prod', '--yes', '--no-wait']);
    try { fs.rmSync(path.join(root, '.vercel'), { recursive: true, force: true }); } catch (_) { /* ignore */ }
    if (dep.status !== 0) { console.log(`   ✗ vercel deploy failed: ${(dep.stderr || '').trim().split('\n').pop()}`); return; }
    console.log(`   deploying (CLI) → ${(dep.stdout || '').trim().split('\n').pop()}`);
    return;
  }
  const d = await api('POST', '/v13/deployments?forceNew=1', {
    name: p.name,
    project: p.id,
    target: 'production',
    gitSource: { type: 'github', repoId, ref: 'main' },
  });
  console.log(`   deploying → https://${d.url}`);
}

async function main() {
  const args = process.argv.slice(2).map(s => s.toLowerCase());
  const targets = args.includes('--all') || !args.length ? BRANDS : args.map(findBrand).filter(Boolean);
  if (!targets.length) { console.error('no matching sites'); process.exit(2); }

  await resolveTeam();
  let ok = 0;
  for (const b of targets) {
    console.log(`\n══ toolsrift-${b.id}  (${b.domain})`);
    try {
      const p = await ensureProject(b);
      await ensureEnv(p, b);
      const attached = await ensureDomain(p, b);
      const fresh = await getProject(p.name);
      await deploy(fresh || p);
      if (attached) ok++;
    } catch (e) {
      console.log(`   ✗ ${e.message}`);
    }
  }
  console.log(`\n${ok}/${targets.length} site(s) fully configured (project + env + domain).`);
  const all = await api('GET', '/v9/projects?limit=100');
  console.log('projects in team now:', (all.projects || []).map(p => p.name).sort().join(', '));
  process.exit(ok === targets.length ? 0 : 1);
}

main().catch(e => { console.error(e.message); process.exit(1); });
