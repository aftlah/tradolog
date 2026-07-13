import { NAV_ITEMS } from '@shared/constants/nav.constants';

/** Map the current pathname to the matching primary nav href (supports nested trade routes). */
export function resolveActiveHref(pathname: string): string {
	if (pathname === '/app' || pathname === '/app/') {
		return '/app';
	}

	const candidates = NAV_ITEMS.filter((item) => item.href !== '/app').sort(
		(left, right) => right.href.length - left.href.length,
	);

	for (const item of candidates) {
		if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
			return item.href;
		}
	}

	return '/app';
}
