import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { getDb } from '@shared/lib/db';
import * as schema from '@shared/lib/db/schema';
import { requireEnv, getEnv } from '@shared/lib/env';

function createAuth() {
	const secret = requireEnv('BETTER_AUTH_SECRET');
	const baseURL = requireEnv('BETTER_AUTH_URL');
	const env = getEnv();

	const googleConfigured =
		typeof env.GOOGLE_CLIENT_ID === 'string' &&
		env.GOOGLE_CLIENT_ID.length > 0 &&
		typeof env.GOOGLE_CLIENT_SECRET === 'string' &&
		env.GOOGLE_CLIENT_SECRET.length > 0;

	return betterAuth({
		baseURL,
		secret,
		database: drizzleAdapter(getDb(), {
			provider: 'pg',
			schema: {
				user: schema.user,
				session: schema.session,
				account: schema.account,
				verification: schema.verification,
			},
		}),
		emailAndPassword: {
			enabled: true,
			minPasswordLength: 8,
			maxPasswordLength: 128,
			revokeSessionsOnPasswordReset: true,
			sendResetPassword: async ({ user, url }) => {
				console.info(
					JSON.stringify({
						level: 'info',
						event: 'auth.password_reset_email',
						email: user.email,
						url,
					}),
				);
			},
		},
		socialProviders: googleConfigured
			? {
					google: {
						clientId: env.GOOGLE_CLIENT_ID as string,
						clientSecret: env.GOOGLE_CLIENT_SECRET as string,
					},
				}
			: undefined,
		session: {
			expiresIn: 60 * 60 * 24 * 7,
			updateAge: 60 * 60 * 24,
			cookieCache: {
				enabled: true,
				maxAge: 60 * 5,
			},
		},
		trustedOrigins: [baseURL],
	});
}

type AuthInstance = ReturnType<typeof createAuth>;

let authInstance: AuthInstance | undefined;

export function getAuth(): AuthInstance {
	if (!authInstance) {
		authInstance = createAuth();
	}
	return authInstance;
}

/** @deprecated Use getAuth() — kept for stable import path from Phase 0. */
export function getAuthClient(): AuthInstance {
	return getAuth();
}

export type Session = NonNullable<
	Awaited<ReturnType<AuthInstance['api']['getSession']>>
>;
