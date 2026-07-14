import { SHARING_PAGE_ROUTE } from '../constants/sharing.constants';

/** Relative accept path — works on any host once prefixed with the current origin. */
export function inviteAcceptPath(token: string): string {
	return `${SHARING_PAGE_ROUTE}/accept?token=${encodeURIComponent(token)}`;
}

/**
 * Absolute invite URL for the browser the user is on right now.
 * Avoids baking localhost from BETTER_AUTH_URL into clipboard when developing locally
 * (or wrong host when APP_URL differs from the public site).
 */
export function inviteUrlFromToken(token: string, origin?: string): string {
	const base =
		origin?.replace(/\/$/, '') ??
		(typeof window !== 'undefined' ? window.location.origin : '');
	return `${base}${inviteAcceptPath(token)}`;
}
