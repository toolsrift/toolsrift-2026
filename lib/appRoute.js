// ── ToolsRift in-app route resolution ────────────────────────────────────────
// Single source of truth for "which tool is this page showing?", shared by the
// useAppRouter() hook in every category component.
//
// WHY THIS EXISTS
// Each tool has a real, indexable URL (/devtools/cidr-calc). The category
// components, however, were written against a hash router (#/tool/<id>), so
// pages/[category]/[tool].js used to WRITE that hash before mounting the widget
// and then re-assert it on every animation frame for 1200ms, racing Next.js's
// post-hydration URL reconciliation.
//
// Googlebot renders cold, throttled and on a render budget — it is exactly the
// client that loses such a race. When it lost, the widget read an empty hash and
// rendered the CATEGORY DASHBOARD under the tool's URL, so Google indexed dozens
// of identical pages per category (all sharing the category's <title>).
//
// The fix is to stop depending on timing at all:
//   1. A non-empty `#/...` hash means the user navigated in-app — it always wins.
//   2. Otherwise the route is derived from the clean URL the page was served at,
//      published by [tool].js during render (before the widget ever mounts).
// There is no window in which the answer is unknown, so there is nothing to race.

// Published by pages/[category]/[tool].js during render. Carries `path` so the
// hint self-invalidates the moment the user navigates somewhere else.
export const TOOL_HINT_KEY = '__TOOLSRIFT_TOOL__';

export function publishToolHint(pathname, toolId) {
  if (typeof window === 'undefined') return;
  window[TOOL_HINT_KEY] = { path: pathname, id: toolId };
}

/**
 * Resolve the current in-app route.
 *
 * @param {object}  [opts]
 * @param {boolean} [opts.categoryRoute=false] Whether the calling component
 *        understands `{ page: 'category' }`. Components that don't must get
 *        `{ page: 'home' }` instead, matching their original behaviour.
 * @returns {{page: 'home'|'tool'|'category', toolId?: string, catId?: string}}
 */
export function resolveAppRoute(opts = {}) {
  const { categoryRoute = false } = opts;
  if (typeof window === 'undefined') return { page: 'home' };

  // 1. An explicit hash means in-app navigation happened. Highest precedence.
  const hash = window.location.hash || '';
  if (hash.startsWith('#/')) {
    const parts = hash.slice(1).split('/').filter(Boolean);
    if (parts[0] === 'tool' && parts[1]) return { page: 'tool', toolId: parts[1] };
    if (parts[0] === 'category' && parts[1]) {
      return categoryRoute ? { page: 'category', catId: parts[1] } : { page: 'home' };
    }
    return { page: 'home' };
  }

  // 2. No hash — fall back to the clean URL this page was served at. This is
  //    the path a crawler (and any cold first load) takes, and it is exact.
  const hint = typeof window[TOOL_HINT_KEY] === 'object' ? window[TOOL_HINT_KEY] : null;
  if (hint && hint.id && hint.path === window.location.pathname) {
    return { page: 'tool', toolId: hint.id };
  }

  return { page: 'home' };
}

/**
 * True when the current page is a /[category]/[tool] route, which server-renders
 * the tool's how-to, FAQ and related-tool links itself. ToolPageLayout uses this
 * to skip its own copies of those sections so the page shows each exactly once —
 * and so the crawlable version is the one that lives in the raw HTML.
 */
export function isArticleOwnedByPage() {
  if (typeof window === 'undefined') return false;
  const hint = typeof window[TOOL_HINT_KEY] === 'object' ? window[TOOL_HINT_KEY] : null;
  return !!(hint && hint.path === window.location.pathname);
}

export default resolveAppRoute;
