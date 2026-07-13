/** Tiny in-process TTL cache for warm serverless isolates (lost on cold start). */
export interface TtlCache<T> {
	get(key: string): T | undefined;
	set(key: string, value: T): void;
	delete(key: string): void;
	deletePrefix(prefix: string): void;
	clear(): void;
}

export function createTtlCache<T>(ttlMs: number): TtlCache<T> {
	const store = new Map<string, { value: T; expiresAt: number }>();

	return {
		get(key: string): T | undefined {
			const entry = store.get(key);
			if (!entry) {
				return undefined;
			}
			if (Date.now() > entry.expiresAt) {
				store.delete(key);
				return undefined;
			}
			return entry.value;
		},
		set(key: string, value: T): void {
			store.set(key, { value, expiresAt: Date.now() + ttlMs });
		},
		delete(key: string): void {
			store.delete(key);
		},
		deletePrefix(prefix: string): void {
			for (const key of store.keys()) {
				if (key.startsWith(prefix)) {
					store.delete(key);
				}
			}
		},
		clear(): void {
			store.clear();
		},
	};
}
