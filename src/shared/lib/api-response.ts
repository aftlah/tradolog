/**
 * Small, reusable helpers for Astro API routes so every route returns errors the same shape
 * instead of hand-rolling `Response`/`JSON.stringify` boilerplate (and accidentally leaking
 * internal error details to the client).
 */
import { getAuth, type Session } from '@shared/lib/auth';
import { AppError, AuthError } from '@shared/lib/errors';

export function jsonResponse(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

export function errorResponse(error: unknown): Response {
	if (error instanceof AppError) {
		return jsonResponse({ error: error.message, code: error.code }, error.statusCode);
	}

	console.error(
		JSON.stringify({
			level: 'error',
			event: 'api.unhandled_error',
			message: error instanceof Error ? error.message : 'Unknown error',
		}),
	);
	return jsonResponse({ error: 'Something went wrong. Please try again.' }, 500);
}

/** Resolves the current session from request headers, throwing a typed 401 when absent. */
export async function requireSession(request: Request): Promise<Session> {
	const session = await getAuth().api.getSession({ headers: request.headers });
	if (!session) {
		throw new AuthError('Unauthorized.');
	}
	return session;
}
