import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { requireEnv } from '@shared/lib/env';
import * as schema from './schema';

type Db = ReturnType<typeof drizzle<typeof schema>>;

let client: ReturnType<typeof postgres> | undefined;
let dbInstance: Db | undefined;

export function getDb(): Db {
	if (dbInstance) {
		return dbInstance;
	}

	const databaseUrl = requireEnv('DATABASE_URL');
	client = postgres(databaseUrl, {
		prepare: false,
		max: 5,
		idle_timeout: 20,
		connect_timeout: 10,
	});
	dbInstance = drizzle(client, { schema });
	return dbInstance;
}

export type { Db };
export { schema };
