// ── ToolsRift tool links ─────────────────────────────────────────────────────
// Every link to a tool must be a real <a href="/{category}/{tool-id}">.
//
// This used to be `href="/devtools#/tool/cidr-calc"` (or a <div role="button">
// with no href at all). Google strips fragments, so the first form pointed at
// /devtools and the second was not a link at all — which left all 1,100+ tool
// URLs orphaned, reachable only through sitemap.xml. That is the lowest-priority
// crawl class Google has, and it is why they sat in "Discovered – currently not
// indexed" while the pages that did get indexed averaged position 72.
//
// The href is now always the clean, canonical URL. In-app navigation still
// happens instantly via the existing hash router — see shouldInterceptClick().

/** Canonical, crawlable URL for a tool. */
export function toolHref(theme, toolId) {
  if (!theme || !theme.pageRoute || !toolId) return undefined;
  return `${theme.pageRoute}/${toolId}`;
}

/**
 * Whether a click should be handled in-app rather than by the browser.
 *
 * Returns false for modified clicks (cmd/ctrl/shift/alt, middle button) so
 * "open in new tab" keeps working, and false when the anchor's real destination
 * is a different Next.js page — there the href must be allowed to navigate.
 */
export function shouldInterceptClick(e, pageRoute) {
  if (typeof window === 'undefined') return false;
  if (e.defaultPrevented) return false;
  if (e.button !== 0) return false;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  // Only the category landing page hosts the whole widget; from anywhere else
  // (including a tool page) let the browser follow the href normally.
  return window.location.pathname === pageRoute;
}
