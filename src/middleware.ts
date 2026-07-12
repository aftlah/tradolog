import { defineMiddleware } from 'astro:middleware';
import { getAuth, type Session } from '@shared/lib/auth';
import {
	AUTH_ROUTES,
	GUEST_ONLY_PATHS,
	PROTECTED_PATH_PREFIXES,
} from '@features/auth/constants/auth.constants';

const SESSION_COOKIE = 'better-auth.session_token';
const SESSION_DATA_COOKIE = 'better-auth.session_data';

function isProtectedPath(pathname: string): boolean {
	return PROTECTED_PATH_PREFIXES.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
	);
}

function isGuestOnlyPath(pathname: string): boolean {
	return GUEST_ONLY_PATHS.some((path) => pathname === path);
}


function buildCookieHeader(context: {
	request: Request;
	cookies: {
		get: (key: string) => { value: string } | undefined;
	};
}): string | null {
	const fromRequest = context.request.headers.get('cookie');
	if (fromRequest && fromRequest.trim().length > 0) {
		return fromRequest;
	}

	const parts: string[] = [];
	const token = context.cookies.get(SESSION_COOKIE);
	const data = context.cookies.get(SESSION_DATA_COOKIE);
	if (token?.value) {
		parts.push(`${SESSION_COOKIE}=${token.value}`);
	}
	if (data?.value) {
		parts.push(`${SESSION_DATA_COOKIE}=${data.value}`);
	}

	return parts.length > 0 ? parts.join('; ') : null;
}


function headersForSessionLookup(request: Request, cookieHeader: string | null): Headers {
	const headers = new Headers(request.headers);
	if (cookieHeader) {
		headers.set('cookie', cookieHeader);
	}
	return headers;
}

export const onRequest = defineMiddleware(async (context, next) => {
	const { pathname } = context.url;

	if (pathname.startsWith('/api/auth')) {
		return next();
	}

	const needsSession = isProtectedPath(pathname) || isGuestOnlyPath(pathname);

	if (!needsSession) {
		context.locals.session = null;
		return next();
	}

	let session: Session | null = null;

	try {
		const cookieHeader = buildCookieHeader(context);
		session =
			(await getAuth().api.getSession({
				headers: headersForSessionLookup(context.request, cookieHeader),
			})) ?? null;
	} catch (error) {
		console.error(
			JSON.stringify({
				level: 'error',
				event: 'middleware.session_lookup_failed',
				pathname,
				message: error instanceof Error ? error.message : 'Unknown session error',
			}),
		);
		session = null;
	}

	if (isProtectedPath(pathname) && !session) {
		return context.redirect(`${AUTH_ROUTES.login}?next=${encodeURIComponent(pathname)}`);
	}

	if (isGuestOnlyPath(pathname) && session) {
		return context.redirect(AUTH_ROUTES.appHome);
	}

	context.locals.session = session;

	return next();
});
