import type { AccountOption } from '@shared/types';

export const APP_CHROME_STATE_ID = 'tradolog-app-chrome-state';

/** Serialized into each app page so the persisted chrome can refresh without remounting. */
export interface AppChromeState {
	title: string;
	userName: string;
	userEmail: string;
	accounts: AccountOption[];
	activeAccountId: string | null;
	/** Primary nav href for the current page — must match SSR and client for hydration. */
	activeHref: string;
	showQuickAdd?: boolean;
	/** When set, account switches navigate here instead of updating the current URL. */
	accountChangePath?: string | null;
}

export function parseAppChromeState(raw: string | null | undefined): AppChromeState | null {
	if (!raw) {
		return null;
	}
	try {
		const parsed: unknown = JSON.parse(raw);
		if (!parsed || typeof parsed !== 'object') {
			return null;
		}
		return parsed as AppChromeState;
	} catch {
		return null;
	}
}
