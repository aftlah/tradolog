import {
	ACTIVE_ACCOUNT_COOKIE,
	ACTIVE_ACCOUNT_COOKIE_MAX_AGE_SECONDS,
} from '@shared/constants/account.constants';

/** Persist the active trading account so the next SSR page can parallelize DB work. */
export function persistActiveAccountCookie(accountId: string): void {
	document.cookie = [
		`${ACTIVE_ACCOUNT_COOKIE}=${encodeURIComponent(accountId)}`,
		'path=/',
		`max-age=${ACTIVE_ACCOUNT_COOKIE_MAX_AGE_SECONDS}`,
		'SameSite=Lax',
	].join('; ');
}

export function readActiveAccountCookieValue(raw: string | undefined | null): string | null {
	if (!raw) {
		return null;
	}
	try {
		const decoded = decodeURIComponent(raw.trim());
		return decoded.length > 0 ? decoded : null;
	} catch {
		return null;
	}
}
