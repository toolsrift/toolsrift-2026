#!/usr/bin/env node
/**
 * scripts/vercel/prune.js — delete old deployments so the Hobby plan's
 * 10 GB "Deployment Storage" is not eaten by superseded builds.
 *
 *   VERCEL_TOKEN=... node scripts/vercel/prune.js --dry-run
 *   VERCEL_TOKEN=... node scripts/vercel/prune.js --keep 2
 *   VERCEL_TOKEN=... node scripts/vercel/prune.js --projects "toolsrift toolsrift-pdf"
 *
 * Per project (the hub "toolsrift" + every toolsrift-<id>) it keeps:
 *   • the current production deployment (newest READY, target=production)
 *   • the next --keep newest READY production deployments (rollback, default 1)
 *   • anything still BUILDING / QUEUED / INITIALIZING
 * and deletes every other deployment: previews, CANCELED / ERROR builds and
 * older production builds. Runs in CI via .github/workflows/vercel-prune.yml.
 */
const { BRANDS } = require('../../lib/sites/brands');

const TOKEN = process.env.VERCEL_TOKEN;
const TEAM_SLUG = process.env.VERCEL_TEAM || 'toolsrifts-projects';
if (!TOKEN) { console.error('VERCEL_TOKEN is required'); process.exit(2); }

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] != null ? argv[i + 1] : d; };
const DRY = flag('--dry-run');
const KEEP = Math.max(0, parseInt(opt('--keep', '1'), 10) || 0);
const ONLY = (opt('--projects', '') || '').split(/[\s,]+/).filter(Boolean);
const ACTIVE = new Set(['BUILDING', 'QUEUED', 'INITIALIZING']);

let teamId = null;
async function api(method, pathname) {
  const url = new URL(`https://api.vercel.com${pathname}`);
  if (teamId) url.searchParams.set('teamId', teamId);
  const res = await fetch(url, { method, headers: { Authorization: `Bearer ${TOKEN}` } });
  if (res.status === 429) { await new Promise(r => setTimeout(r, 5000)); return api(method, pathname); }
  if (!res.ok) throw new Error(`${method} ${pathname} → ${res.status} ${(await res.text()).slice(0, 200)}`);
  return res.status === 204 ? null : res.json();
}

async function listAll(projectId) {
  const out = [];
  let until = null;
  for (let page = 0; page < 20; page++) {
    const r = await api('GET', `/v6/deployments?projectId=${projectId}&limit=100${until ? `&until=${until}` : ''}`);
    const deps = r.deployments || [];
    out.push(...deps);
    if (deps.length < 100 || !r.pagination || !r.pagination.next) break;
    until = r.pagination.next;
  }
  return out;
}

async function pruneProject(p, report) {
  const deps = (await listAll(p.id)).sort((a, b) => b.created - a.created);
  const state = (d) => d.state || d.readyState;
  const prodReady = deps.filter(d => d.target === 'production' && state(d) === 'READY');
  const keep = new Set([...prodReady.slice(0, 1 + KEEP), ...deps.filter(d => ACTIVE.has(state(d)))].map(d => d.uid || d.id));
  const doomed = deps.filter(d => !keep.has(d.uid || d.id));

  let deleted = 0, failed = 0;
  for (const d of doomed) {
    const id = d.uid || d.id;
    if (DRY) { deleted++; continue; }
    try { await api('DELETE', `/v13/deployments/${id}`); deleted++; }
    catch (e) { failed++; console.log(`   ✗ ${id} (${state(d)}, ${d.target || 'preview'}): ${e.message}`); }
  }
  const cur = prodReady[0];
  console.log(`${p.name.padEnd(24)} total ${String(deps.length).padStart(3)} · keep ${String(keep.size).padStart(2)} · ${DRY ? 'would delete' : 'deleted'} ${String(deleted).padStart(3)}${failed ? ` · failed ${failed}` : ''}   live: ${cur ? (cur.url || cur.uid) : 'none'}`);
  report.push({ project: p.name, total: deps.length, kept: keep.size, deleted, failed });
}

async function main() {
  const team = await api('GET', `/v2/teams?slug=${encodeURIComponent(TEAM_SLUG)}`);
  teamId = team.id;
  const all = (await api('GET', '/v9/projects?limit=100')).projects || [];
  const wanted = new Set(ONLY.length ? ONLY : ['toolsrift', ...BRANDS.map(b => `toolsrift-${b.id}`)]);
  const projects = all.filter(p => wanted.has(p.name));
  const missing = [...wanted].filter(n => !projects.some(p => p.name === n));
  if (missing.length) console.log(`(no such project: ${missing.join(', ')})`);
  console.log(`${DRY ? 'DRY RUN — ' : ''}keeping the live production deployment + ${KEEP} rollback per project\n`);

  const report = [];
  for (const p of projects) {
    try { await pruneProject(p, report); }
    catch (e) { console.log(`${p.name.padEnd(24)} ✗ ${e.message}`); report.push({ project: p.name, error: e.message }); }
  }
  const sum = (k) => report.reduce((n, r) => n + (r[k] || 0), 0);
  const line = `\n${projects.length} projects · ${sum('total')} deployments · ${DRY ? 'would delete' : 'deleted'} ${sum('deleted')} · failed ${sum('failed')}`;
  console.log(line);
  if (process.env.GITHUB_STEP_SUMMARY) {
    const fs = require('fs');
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Vercel prune${DRY ? ' (dry run)' : ''}\n\n| project | deployments | kept | ${DRY ? 'would delete' : 'deleted'} | failed |\n|---|---|---|---|---|\n${report.map(r => `| ${r.project} | ${r.total ?? '-'} | ${r.kept ?? '-'} | ${r.deleted ?? '-'} | ${r.error ? r.error : (r.failed || 0)} |`).join('\n')}\n${line}\n`);
  }
  process.exit(sum('failed') ? 1 : 0);
}

main().catch(e => { console.error(e.message); process.exit(1); });
