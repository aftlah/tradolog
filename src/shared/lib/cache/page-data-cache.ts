import { createTtlCache } from './ttl-cache';

/** Soft-nav revisit window — warm isolates skip a full DB rebuild. */
const PAGE_DATA_TTL_MS = 20_000;

/**
 * Shared process cache for heavy SSR payloads (dashboard / analytics / calendar).
 * Invalidated on trade mutations so the next load stays correct.
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

/** Drop all cached page payloads for a user after trades/accounts change. */
export function invalidateUserPageCaches(userId: string): void {
	pageDataCache.deletePrefix(`dashboard:${userId}:`);
	pageDataCache.deletePrefix(`analytics:${userId}:`);
	pageDataCache.deletePrefix(`calendar:${userId}:`);
}
