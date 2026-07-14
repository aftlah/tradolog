import { Redis } from '@upstash/redis';
import { getEnv } from '@shared/lib/env';
import { createTtlCache } from './ttl-cache';

const PAGE_DATA_TTL_SECONDS = 60;
const PAGE_DATA_TTL_MS = PAGE_DATA_TTL_SECONDS * 1000;
const KEY_PREFIX = 'tradolog:v1:';

const memory = createTtlCache<unknown>(PAGE_DATA_TTL_MS);

let redisClient: Redis | null | undefined;

function getRedis(): Redis | null {
	if (redisClient !== undefined) {
		return redisClient;
	}

	try {
		const env = getEnv();
		const url = env.UPSTASH_REDIS_REST_URL;
		const token = env.UPSTASH_REDIS_REST_TOKEN;
		if (!url || !token) {
			redisClient = null;
			return null;
		}
		redisClient = new Redis({ url, token });
		return redisClient;
	} catch {
		redisClient = null;
		return null;
	}
}

function namespaced(key: string): string {
	return `${KEY_PREFIX}${key}`;
}

function indexKey(userId: string): string {
	return namespaced(`idx:${userId}`);
}

function extractUserId(cacheKey: string): string | null {
	const segments = cacheKey.split(':');
	// dashboard|analytics|calendar|trades|accounts : userId : ...
	if (segments.length >= 2 && segments[1]) {
		return segments[1];
	}
	return null;
}

/**
 * Shared page-data cache: Upstash Redis when configured, otherwise in-process TTL.
 * Safe under Vercel serverless (Redis survives cold starts / isolate churn).
 */
export async function cacheGet<T>(key: string): Promise<T | undefined> {
	const local = memory.get(key);
	if (local !== undefined) {
		return local as T;
	}

	const redis = getRedis();
	if (!redis) {
		return undefined;
	}

	try {
		const value = await redis.get<T>(namespaced(key));
		if (value === null || value === undefined) {
			return undefined;
		}
		memory.set(key, value);
		return value;
	} catch {
		return undefined;
	}
}

export async function cacheSet(key: string, value: unknown): Promise<void> {
	memory.set(key, value);

	const redis = getRedis();
	if (!redis) {
		return;
	}

	try {
		const redisKey = namespaced(key);
		const userId = extractUserId(key);
		const pipeline = redis.pipeline();
		pipeline.set(redisKey, value, { ex: PAGE_DATA_TTL_SECONDS });
		if (userId) {
			pipeline.sadd(indexKey(userId), key);
			pipeline.expire(indexKey(userId), PAGE_DATA_TTL_SECONDS * 2);
		}
		await pipeline.exec();
	} catch {
		// Cache is best-effort — never fail the request.
	}
}

export async function cacheDelete(key: string): Promise<void> {
	memory.delete(key);
	const redis = getRedis();
	if (!redis) {
		return;
	}
	try {
		await redis.del(namespaced(key));
	} catch {
		// ignore
	}
}

/** Drop all cached page payloads for a user after trades/accounts change. */
export async function invalidateUserPageCaches(userId: string): Promise<void> {
	memory.deletePrefix(`dashboard:${userId}:`);
	memory.deletePrefix(`analytics:${userId}:`);
	memory.deletePrefix(`calendar:${userId}:`);
	memory.deletePrefix(`trades:${userId}:`);
	memory.delete(accountsCacheKey(userId));

	const redis = getRedis();
	if (!redis) {
		return;
	}

	try {
		const idx = indexKey(userId);
		const keys = await redis.smembers(idx);
		const pipeline = redis.pipeline();
		for (const key of keys) {
			if (typeof key === 'string') {
				pipeline.del(namespaced(key));
				memory.delete(key);
			}
		}
		pipeline.del(namespaced(accountsCacheKey(userId)));
		pipeline.del(idx);
		await pipeline.exec();
	} catch {
		// ignore
	}
}

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

/** @deprecated Prefer cacheGet/cacheSet — kept for migration; sync memory-only accessor. */
export const pageDataCache = {
	get<T>(key: string): T | undefined {
		return memory.get(key) as T | undefined;
	},
	set(key: string, value: unknown): void {
		void cacheSet(key, value);
	},
	delete(key: string): void {
		void cacheDelete(key);
	},
	deletePrefix(prefix: string): void {
		memory.deletePrefix(prefix);
	},
};
