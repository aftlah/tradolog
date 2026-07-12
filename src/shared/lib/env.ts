import { loadEnv } from 'vite';
import { z } from 'zod';

const envSchema = z.object({
	DATABASE_URL: z.url().optional(),
	BETTER_AUTH_SECRET: z.string().min(32).optional(),
	BETTER_AUTH_URL: z.url().optional(),
	GOOGLE_CLIENT_ID: z.string().optional(),
	GOOGLE_CLIENT_SECRET: z.string().optional(),
	R2_ACCOUNT_ID: z.string().optional(),
	R2_ACCESS_KEY_ID: z.string().optional(),
	R2_SECRET_ACCESS_KEY: z.string().optional(),
	R2_BUCKET_NAME: z.string().optional(),
	R2_PUBLIC_URL: z.url().optional(),
});

export type Env = z.infer<typeof envSchema>;

function pick(...candidates: Array<string | undefined>): string | undefined {
	for (const candidate of candidates) {
		if (typeof candidate === 'string' && candidate.trim().length > 0) {
			return candidate;
		}
	}
	return undefined;
}

/**
 * Read env for Astro SSR + Node scripts (tsx).
 * - `loadEnv(..., '')` reads `.env*` from disk (all keys, not only PUBLIC_/VITE_).
 * - Bracket `process.env[name]` avoids Vite replacing static `process.env.NAME` with undefined.
 */
function readRawEnv(): Record<keyof Env, string | undefined> {
	const mode = process.env.NODE_ENV ?? 'development';
	const fileEnv = loadEnv(mode, process.cwd(), '');

	const fromRuntime = (name: keyof Env): string | undefined => {
		return pick(fileEnv[name], process.env[name]);
	};

	return {
		DATABASE_URL: fromRuntime('DATABASE_URL'),
		BETTER_AUTH_SECRET: fromRuntime('BETTER_AUTH_SECRET'),
		BETTER_AUTH_URL: fromRuntime('BETTER_AUTH_URL'),
		GOOGLE_CLIENT_ID: fromRuntime('GOOGLE_CLIENT_ID'),
		GOOGLE_CLIENT_SECRET: fromRuntime('GOOGLE_CLIENT_SECRET'),
		R2_ACCOUNT_ID: fromRuntime('R2_ACCOUNT_ID'),
		R2_ACCESS_KEY_ID: fromRuntime('R2_ACCESS_KEY_ID'),
		R2_SECRET_ACCESS_KEY: fromRuntime('R2_SECRET_ACCESS_KEY'),
		R2_BUCKET_NAME: fromRuntime('R2_BUCKET_NAME'),
		R2_PUBLIC_URL: fromRuntime('R2_PUBLIC_URL'),
	};
}

let cachedEnv: Env | undefined;

export function getEnv(): Env {
	if (cachedEnv) {
		return cachedEnv;
	}

	const parsed = envSchema.safeParse(readRawEnv());

	if (!parsed.success) {
		throw new Error(`Invalid environment variables: ${parsed.error.message}`);
	}

	cachedEnv = parsed.data;
	return cachedEnv;
}

/** Clear cache (useful in tests / long-running scripts). */
export function resetEnvCache(): void {
	cachedEnv = undefined;
}

export function requireEnv<K extends keyof Env>(key: K): NonNullable<Env[K]> {
	const value = getEnv()[key];
	if (value === undefined || value === '') {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
}
