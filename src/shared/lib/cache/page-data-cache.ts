import { createTtlCache } from './ttl-cache';

/** Warm-isolate revisit window — skip repeated DB work on back-to-back navigations. */
const PAGE_DATA_TTL_MS = 30_000;

/**
 * Shared process cache for heavy SSR payloads.
 * Invalidated on trade/account mutations so the next load stays correct.
 */
export const pageDataCache = createTtlCache<unknown>(PAGE_DATA_TTL_MS);

export function dashboardCacheKey(userId: string, accountId: string): string {
	return `dashboard:${userId}:${accountId}`;
}

export function analyticsCacheKey(userId: string, accountId: string): string {
	return `analytics:${userId}:${accountId}`;
}

export function calendarCacheKey(userId: string, accountId: string, year: number, month: number): string {
	return `calendar:${userId}:${accountId}:${year}-${month}`;
}

export function accountsCacheKey(userId: string): string {
	return `accounts:${userId}`;
}

/** Drop all cached page payloads for a user after trades/accounts change. */
export function invalidateUserPageCaches(userId: string): void {
	pageDataCache.deletePrefix(`dashboard:${userId}:`);
	pageDataCache.deletePrefix(`analytics:${userId}:`);
	pageDataCache.deletePrefix(`calendar:${userId}:`);
	pageDataCache.deletePrefix(`trades:${userId}:`);
	pageDataCache.delete(accountsCacheKey(userId));
}
