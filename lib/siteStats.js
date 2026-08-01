// ── ToolsRift site-wide counts ───────────────────────────────────────────────
// Derived from the generated tool registry, so the numbers in copy can never
// drift from reality again.
//
// They had drifted badly: the live homepage still said "957+ tools across 24
// categories" (and /about said "590+ across 34") long after the site had grown
// to 1,136 tools across 29 categories. Google was quoting those numbers back in
// the search snippet and the AI Overview, because they were the numbers the page
// actually served. Hardcoding a count in prose means signing up to update it in
// a dozen files every time a tool ships — import these instead.

import TOOL_REGISTRY from './toolRegistry';

export const TOTAL_CATEGORIES = Object.keys(TOOL_REGISTRY).length;

export const TOTAL_TOOLS = Object.values(TOOL_REGISTRY)
  .reduce((n, c) => n + ((c.tools && c.tools.length) || 0), 0);

/** "1,136" — grouped for display in prose and headings. */
export const TOOLS_LABEL = TOTAL_TOOLS.toLocaleString('en-US');

/** "1,136+" — the form used in titles, meta descriptions and CTAs. */
export const TOOLS_PLUS = `${TOOLS_LABEL}+`;
