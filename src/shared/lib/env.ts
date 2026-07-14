import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

const envSchema = z.object({
	DATABASE_URL: z.string().min(1).optional(),
	BETTER_AUTH_SECRET: z.string().min(32).optional(),
	BETTER_AUTH_URL: z.url().optional(),
	GOOGLE_CLIENT_ID: z.string().optional(),
	GOOGLE_CLIENT_SECRET: z.string().optional(),
	R2_ACCOUNT_ID: z.string().optional(),
	R2_ACCESS_KEY_ID: z.string().optional(),
	R2_SECRET_ACCESS_KEY: z.string().optional(),
	R2_BUCKET_NAME: z.string().optional(),
	R2_PUBLIC_URL: z.url().optional(),
	GEMINI_API_KEY: z.string().optional(),
	GEMINI_MODEL: z.string().optional(),
	UPSTASH_REDIS_REST_URL: z.url().optional(),
	UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
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

let dotenvLoaded = false;

/**
 * Load local `.env` when present (dev / scripts). No-op on Vercel where secrets come from
 * the dashboard into `process.env` and there is no `.env` file in the deployment.
 *
 * Never import `vite` here — it pulls Rolldown native bindings and crashes serverless.
 */
function ensureDotenvLoaded(forceReload = false): void {
	if (dotenvLoaded && !forceReload) {
		return;
	}
	dotenvLoaded = true;
	// `override: true` so edited `.env` values win over a stale process.env from an earlier load.
	loadDotenv({ quiet: true, override: forceReload });
}

/**
 * Read env for Astro SSR + Vercel serverless + Node scripts.
 * Bracket access `process.env[name]` avoids Vite build-time env inlining.
 */
function readRawEnv(): Record<keyof Env, string | undefined> {
	const isDev = process.env.NODE_ENV !== 'production';
	ensureDotenvLoaded(isDev);

	const fromRuntime = (name: keyof Env): string | undefined => {
		return pick(process.env[name]);
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
		GEMINI_API_KEY: fromRuntime('GEMINI_API_KEY'),
		GEMINI_MODEL: fromRuntime('GEMINI_MODEL'),
		UPSTASH_REDIS_REST_URL: fromRuntime('UPSTASH_REDIS_REST_URL'),
		UPSTASH_REDIS_REST_TOKEN: fromRuntime('UPSTASH_REDIS_REST_TOKEN'),
	};
}

let cachedEnv: Env | undefined;

export function getEnv(): Env {
	const isDev = process.env.NODE_ENV !== 'production';
	if (cachedEnv && !isDev) {
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
	dotenvLoaded = false;
}

export function requireEnv<K extends keyof Env>(key: K): NonNullable<Env[K]> {
	const value = getEnv()[key];
	if (value === undefined || value === '') {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
}
