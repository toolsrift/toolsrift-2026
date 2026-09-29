#!/usr/bin/env node
/**
 * scripts/vercel/consolidate.js — move every former category subdomain onto the
 * hub Vercel project and (optionally) delete the per-category projects, so the
 * whole of ToolsRift is ONE project again. One-time migration; idempotent.
 *
 *   VERCEL_TOKEN=... node scripts/vercel/consolidate.js                    # dry run: report only
 *   VERCEL_TOKEN=... node scripts/vercel/consolidate.js --apply            # move the domains
 *   VERCEL_TOKEN=... node scripts/vercel/consolidate.js --apply --delete-projects
 *
 * For each brand in lib/sites/brands.js it:
 *   1. detaches `legacyDomain` (pdf.toolsrift.com, …) from its old
 *      "toolsrift-<id>" project, if attached there;
 *   2. attaches it to the hub project, where middleware.js 301s every URL on it
 *      to toolsrift.com/<slug>/… and serves /.well-known/assetlinks.json;
 *   3. with --delete-projects, deletes "toolsrift-<id>" (deployments included).
 *      Deleting is permanent — run it only once every subdomain answers from
 *      the hub (step 2 done, `npm run sites:live` green).
 *
 * Safety gate: nothing is moved unless https://toolsrift.com is already
 * serving the path-based build (it checks /pdf/manifest.webmanifest). Moving a
 * subdomain onto a hub that still runs the old code would serve the hub home
 * page there instead of redirecting.
 *
 * Env: VERCEL_TOKEN (required), VERCEL_TEAM (default "toolsrifts-projects"),
 *      HUB_PROJECT (default "toolsrift").
 * Runs in CI via .github/workflows/vercel-consolidate.yml.
 */
const { BRANDS } = require('../../lib/sites/brands');

const TOKEN = process.env.VERCEL_TOKEN;
const TEAM_SLUG = process.env.VERCEL_TEAM || 'toolsrifts-projects';
const HUB_PROJECT = process.env.HUB_PROJECT || 'toolsrift';
const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const DELETE = args.includes('--delete-projects');

if (!TOKEN) { console.error('VERCEL_TOKEN is required'); process.exit(2); }

let teamId = null;
async function api(method, path, body) {
  const url = new URL(`https://api.vercel.com${path}`);
  if (teamId && !url.searchParams.has('teamId')) url.searchParams.set('teamId', teamId);
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 429) { await new Promise(r => setTimeout(r, 5000)); return api(method, path, body); }
  let data = null;
  try { data = await res.json(); } catch (_) { /* no body */ }
  if (!res.ok) {
    const err = new Error(`${method} ${path} → ${(data && data.error && (data.error.message || data.error.code)) || res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

async function getProject(name) {
  try { return await api('GET', `/v9/projects/${encodeURIComponent(name)}`); }
  catch (e) { if (e.status === 404) return null; throw e; }
}

async function domainsOf(p) {
  return ((await api('GET', `/v9/projects/${p.id}/domains?limit=100`)).domains || []).map(d => d.name);
}

async function hubServesSections() {
  try {
    const res = await fetch('https://toolsrift.com/pdf/manifest.webmanifest', { redirect: 'manual' });
    const body = res.ok ? await res.json() : null;
    return !!(body && body.scope === '/pdf/');
  } catch (_) {
    return false;
  }
}

async function main() {
  const team = await api('GET', `/v2/teams?slug=${encodeURIComponent(TEAM_SLUG)}`);
  teamId = team.id;
  const hub = await getProject(HUB_PROJECT);
  if (!hub) { console.error(`hub project "${HUB_PROJECT}" not found`); process.exit(2); }
  const hubDomains = new Set(await domainsOf(hub));
  console.log(`${APPLY ? 'APPLY' : 'DRY RUN'} — hub project ${hub.name} (${hub.id})${DELETE ? ', deleting legacy projects' : ''}\n`);

  if (APPLY && !(await hubServesSections())) {
    console.error('✗ toolsrift.com is not serving the path-based build yet (/pdf/manifest.webmanifest).');
    console.error('  Deploy the hub first (Actions → vercel-deploy-unlinked → Run workflow), then re-run.');
    process.exit(1);
  }

  let pending = 0;
  for (const b of BRANDS) {
    const d = b.legacyDomain;
    const name = `toolsrift-${b.id}`;
    const legacy = await getProject(name);
    const onLegacy = legacy ? (await domainsOf(legacy)).includes(d) : false;
    const onHub = hubDomains.has(d);
    const state = `${d.padEnd(28)} hub:${onHub ? '✓' : '✗'}  ${name}:${legacy ? (onLegacy ? 'has domain' : 'exists') : 'gone'}`;
    if (!APPLY) {
      console.log(state);
      if (!onHub || legacy) pending++;
      continue;
    }
    try {
      if (onLegacy) {
        await api('DELETE', `/v9/projects/${legacy.id}/domains/${encodeURIComponent(d)}`);
        console.log(`   detached ${d} from ${name}`);
      }
      if (!onHub) {
        await api('POST', `/v10/projects/${hub.id}/domains`, { name: d });
        console.log(`   attached ${d} to ${hub.name}`);
      }
      if (legacy && DELETE) {
        await api('DELETE', `/v9/projects/${legacy.id}`);
        console.log(`   deleted project ${name}`);
      }
      console.log(`✓ ${d}`);
    } catch (e) {
      pending++;
      console.log(`✗ ${d}: ${e.message}`);
    }
  }

  if (!APPLY) {
    console.log(`\n${pending} brand(s) still to consolidate. Re-run with --apply (and later --delete-projects).`);
    return;
  }
  console.log(`\n${BRANDS.length - pending}/${BRANDS.length} consolidated.`);
  process.exit(pending ? 1 : 0);
}

main().catch(e => { console.error(e.message); process.exit(1); });
