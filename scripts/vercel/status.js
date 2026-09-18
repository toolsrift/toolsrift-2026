#!/usr/bin/env node
/**
 * scripts/vercel/status.js — one table: every network-site Vercel project,
 * its git link, attached domain(s) and latest production deployment state.
 *
 *   VERCEL_TOKEN=... node scripts/vercel/status.js
 *   VERCEL_TOKEN=... node scripts/vercel/status.js --json   (machine-readable)
 *
 * Runs in CI via .github/workflows/vercel-status.yml. Exit code 0 when every
 * brand has a project with its subdomain attached and a READY production
 * deployment; 1 otherwise (so the workflow shows red until all 29 are live).
 */
const { BRANDS } = require('../../lib/sites/brands');

const TOKEN = process.env.VERCEL_TOKEN;
const TEAM_SLUG = process.env.VERCEL_TEAM || 'toolsrifts-projects';
if (!TOKEN) { console.error('VERCEL_TOKEN is required'); process.exit(2); }

let teamId = null;
async function api(pathname) {
  const url = new URL(`https://api.vercel.com${pathname}`);
  if (teamId) url.searchParams.set('teamId', teamId);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) throw new Error(`${pathname} → ${res.status}`);
  return res.json();
}

async function main() {
  const team = await api(`/v2/teams?slug=${encodeURIComponent(TEAM_SLUG)}`);
  teamId = team.id;
  const all = (await api('/v9/projects?limit=100')).projects || [];
  const byName = Object.fromEntries(all.map(p => [p.name, p]));

  const rows = [];
  for (const b of BRANDS) {
    const name = `toolsrift-${b.id}`;
    const p = byName[name];
    if (!p) { rows.push({ id: b.id, project: name, exists: false, domain: b.domain, attached: false, linked: false, deployment: '-', ready: false }); continue; }
    const domains = ((await api(`/v9/projects/${p.id}/domains`)).domains || []).map(d => d.name);
    const deps = (await api(`/v6/deployments?projectId=${p.id}&target=production&limit=1`)).deployments || [];
    const d = deps[0];
    rows.push({
      id: b.id, project: name, exists: true, domain: b.domain,
      attached: domains.includes(b.domain), linked: !!p.link,
      deployment: d ? `${d.state || d.readyState}${d.url ? ' ' + d.url : ''}` : 'none',
      ready: !!d && (d.state === 'READY' || d.readyState === 'READY'),
    });
  }

  if (process.argv.includes('--json')) { console.log(JSON.stringify(rows, null, 2)); }
  else {
    const pad = (s, n) => String(s).padEnd(n);
    console.log(pad('site', 13) + pad('project', 24) + pad('git', 5) + pad('domain attached', 30) + 'production deployment');
    console.log('-'.repeat(110));
    for (const r of rows) {
      console.log(pad(r.id, 13) + pad(r.exists ? r.project : '(missing)', 24) + pad(r.linked ? 'yes' : 'no', 5) + pad(`${r.attached ? '✓' : '✗'} ${r.domain}`, 30) + r.deployment);
    }
  }
  const live = rows.filter(r => r.exists && r.attached && r.ready);
  console.log(`\n${live.length}/${rows.length} sites fully live (project + domain + READY production deployment)`);
  if (live.length) console.log('live ids: ' + live.map(r => r.id).join(' '));
  process.exit(live.length === rows.length ? 0 : 1);
}

main().catch(e => { console.error(e.message); process.exit(1); });
