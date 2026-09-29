#!/usr/bin/env node
/**
 * scripts/vercel/rollback-legacy.js — put the old per-category projects
 * (toolsrift-<id>) back on the production deployment they had BEFORE they were
 * deployed from a given commit. Uses Vercel's Instant Rollback, which re-points
 * the production domains and does not count against the daily deployment quota.
 *
 *   VERCEL_TOKEN=... node scripts/vercel/rollback-legacy.js --sha 121f353            # dry run
 *   VERCEL_TOKEN=... node scripts/vercel/rollback-legacy.js --sha 121f353 --apply
 *
 * Why it exists: on 2026-09-29 the first deploy of the subfolder build ran out
 * of Hobby quota after deploying 18 legacy projects but before the hub. Those
 * subdomains then 301'd to toolsrift.com/<slug> while the hub — still on the old
 * build — 301'd /<slug> back to the subdomain: a redirect loop. Rolling the
 * legacy projects back restores the previous, consistent state until the hub
 * can be deployed. The hub project ("toolsrift") is never touched.
 *
 * Per project: first CANCEL every production deployment from --sha that is
 * still queued or building (Hobby builds one at a time, so most of them were
 * still waiting and would otherwise go live one by one); then, if the live
 * production deployment was built from --sha, roll back to the newest READY
 * production deployment built from any other commit.
 * Env: VERCEL_TOKEN (required), VERCEL_TEAM (default "toolsrifts-projects").
 */
const TOKEN = process.env.VERCEL_TOKEN;
const TEAM_SLUG = process.env.VERCEL_TEAM || 'toolsrifts-projects';
const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const shaIdx = argv.indexOf('--sha');
const SHA = (shaIdx >= 0 ? argv[shaIdx + 1] || '' : '').toLowerCase();

if (!TOKEN) { console.error('VERCEL_TOKEN is required'); process.exit(2); }
if (SHA.length < 7) { console.error('--sha <commit> (at least 7 characters) is required'); process.exit(2); }

let teamId = null;
async function api(method, path) {
  const url = new URL(`https://api.vercel.com${path}`);
  if (teamId) url.searchParams.set('teamId', teamId);
  const res = await fetch(url, { method, headers: { Authorization: `Bearer ${TOKEN}` } });
  if (res.status === 429) { await new Promise(r => setTimeout(r, 5000)); return api(method, path); }
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

const shaOf = d => ((d.meta && d.meta.githubCommitSha) || '').toLowerCase();
const stateOf = d => d.state || d.readyState;
const IN_FLIGHT = new Set(['QUEUED', 'BUILDING', 'INITIALIZING']);

async function main() {
  const team = await api('GET', `/v2/teams?slug=${encodeURIComponent(TEAM_SLUG)}`);
  teamId = team.id;
  const projects = ((await api('GET', '/v9/projects?limit=100')).projects || [])
    .filter(p => /^toolsrift-/.test(p.name));
  console.log(`${APPLY ? 'APPLY' : 'DRY RUN'} — rolling back legacy projects currently on ${SHA.slice(0, 7)}\n`);

  let failed = 0, rolled = 0, cancelled = 0;
  for (const p of projects) {
    const deps = ((await api('GET', `/v6/deployments?projectId=${p.id}&target=production&limit=20`)).deployments || [])
      .sort((a, b) => b.created - a.created);

    for (const d of deps.filter(d => IN_FLIGHT.has(stateOf(d)) && shaOf(d).startsWith(SHA))) {
      const id = d.uid || d.id;
      if (!APPLY) { console.log(`→  ${p.name.padEnd(24)} would cancel ${stateOf(d)} deployment ${id}`); cancelled++; continue; }
      try {
        await api('PATCH', `/v12/deployments/${id}/cancel`);
        cancelled++;
        console.log(`✓  ${p.name.padEnd(24)} cancelled ${stateOf(d)} deployment ${id}`);
      } catch (e) {
        failed++;
        console.log(`✗  ${p.name.padEnd(24)} cancel ${id}: ${e.message}`);
      }
    }

    // Vercel's own pointer to what is live (fresh read, not the list snapshot).
    const fresh = await api('GET', `/v9/projects/${p.id}`);
    const currentId = fresh.targets && fresh.targets.production && (fresh.targets.production.id || fresh.targets.production.uid);
    const current = deps.find(d => (d.uid || d.id) === currentId) || deps.find(d => stateOf(d) === 'READY');
    if (!current || !shaOf(current).startsWith(SHA)) {
      console.log(`   ${p.name.padEnd(24)} not on ${SHA.slice(0, 7)} (live ${shaOf(current || {}).slice(0, 7) || '?'}) — left alone`);
      continue;
    }
    const target = deps.find(d => stateOf(d) === 'READY' && !shaOf(d).startsWith(SHA) && d.created < current.created);
    if (!target) { failed++; console.log(`✗  ${p.name.padEnd(24)} no earlier READY production deployment to roll back to`); continue; }
    const id = target.uid || target.id;
    if (!APPLY) { console.log(`→  ${p.name.padEnd(24)} would roll back to ${id} (${shaOf(target).slice(0, 7)}, ${new Date(target.created).toISOString()})`); rolled++; continue; }
    try {
      await api('POST', `/v9/projects/${p.id}/rollback/${id}`);
      rolled++;
      console.log(`✓  ${p.name.padEnd(24)} rolled back to ${id} (${shaOf(target).slice(0, 7)})`);
    } catch (e) {
      if (/current production deployment/i.test(e.message)) {
        console.log(`   ${p.name.padEnd(24)} already live on ${id} (${shaOf(target).slice(0, 7)}) — nothing to roll back`);
        continue;
      }
      failed++;
      console.log(`✗  ${p.name.padEnd(24)} ${e.message}`);
    }
  }
  console.log(`\n${cancelled} deployment(s) ${APPLY ? 'cancelled' : 'to cancel'}, ${rolled} project(s) ${APPLY ? 'rolled back' : 'to roll back'}, ${failed} failed.`);
  process.exit(failed ? 1 : 0);
}

main().catch(e => { console.error(e.message); process.exit(1); });
