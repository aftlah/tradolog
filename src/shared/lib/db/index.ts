import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { requireEnv } from '@shared/lib/env';
import * as schema from './schema';

type Db = ReturnType<typeof drizzle<typeof schema>>;

let client: ReturnType<typeof postgres> | undefined;
let dbInstance: Db | undefined;

function resolvePoolMax(databaseUrl: string): number {
	// Serverless isolates should keep a single connection; larger pools multiply Neon slots.
	if (process.env.VERCEL || databaseUrl.includes('-pooler') || databaseUrl.includes('neon.tech')) {
		return 1;
	}
	return 5;
}

export function getDb(): Db {
	if (dbInstance) {
		return dbInstance;
	}

	const databaseUrl = requireEnv('DATABASE_URL');
	client = postgres(databaseUrl, {
		prepare: false,
		max: resolvePoolMax(databaseUrl),
		idle_timeout: 20,
		connect_timeout: 8,
	});
	dbInstance = drizzle(client, { schema });
	return dbInstance;
}

export type { Db };
export { schema };
