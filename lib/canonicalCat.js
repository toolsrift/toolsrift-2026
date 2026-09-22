// ── Canonical category for each tool id ───────────────────────────────────────
// A handful of tools are deliberately listed in two categories (csv-to-json in
// both formatters and json, hmac-generator in both devtools and hash, and nine
// others). Each of those renders a real, working page under BOTH categories —
// and since the network split, under two different hosts, each self-canonical.
// Left alone that is cross-host duplicate content on a site already carrying a
// scaled-content action.
//
// The rule, already applied in pages/[slug]/[tool].js and
// scripts/generate-sitemap.js and now shared from here: whichever category the
// registry lists FIRST owns the tool. Every other surface — sitemaps, the hub's
// homepage directory, the standalone canonical tag — points at that one URL.
//
// scripts/generate-sitemap.js keeps its own copy of this derivation on purpose:
// it runs under plain `node`, not webpack, and reads toolRegistry.js as text
// rather than importing it. Keep the two in step.

import TOOL_REGISTRY from './toolRegistry'

const CANONICAL_CAT = (() => {
  const m = {}
  for (const [cat, data] of Object.entries(TOOL_REGISTRY)) {
    for (const t of (data.tools || [])) if (!(t.id in m)) m[t.id] = cat
  }
  return m
})()

/** True when `cat` is the canonical category for `toolId` (unknown ids pass). */
export function isCanonicalCat(toolId, cat) {
  return !(toolId in CANONICAL_CAT) || CANONICAL_CAT[toolId] === cat
}

export default CANONICAL_CAT
