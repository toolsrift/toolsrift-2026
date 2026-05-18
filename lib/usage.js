// lib/usage.js — PHASE 1: No-op version. All tools free, no daily limits.
// Re-enable real tracking in Phase 2 by restoring the original implementation.
// PHASE 1: All tools free. Pro gating disabled. Re-enable in Phase 2.

export const DAILY_LIMIT = 9999;

export function getUsage()      { return { date: '', count: 0, tools: {} }; }
export function trackUse()      { /* PHASE 1: no-op */ }
export function getCount()      { return 0; }
export function getRemaining()  { return 999; }
export function isLimitReached(){ return false; }
export function isPro()         { return true; }
export function activatePro()   { /* PHASE 1: everyone is pro */ }
