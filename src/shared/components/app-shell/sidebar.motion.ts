export const SIDEBAR_EXPANDED_WIDTH = 256;
export const SIDEBAR_COLLAPSED_WIDTH = 72;
export const SIDEBAR_COLLAPSED_KEY = 'tradolog.sidebar.collapsed';

export const SIDEBAR_LAYOUT_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
export const SIDEBAR_LAYOUT_MS = 300;

export const sidebarLabelTransition = {
	duration: 0.18,
	ease: [0.22, 1, 0.36, 1] as const,
};

export function readSidebarCollapsedPreference(): boolean {
	if (typeof window === 'undefined') {
		return false;
	}
	try {
		return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
	} catch {
		return false;
	}
}

/** Keep `<html data-sidebar-collapsed>` in sync so CSS wins before React hydrates. */
export function syncSidebarCollapsedDocument(collapsed: boolean): void {
	if (typeof document === 'undefined') {
		return;
	}
	if (collapsed) {
		document.documentElement.dataset.sidebarCollapsed = '1';
	} else {
		delete document.documentElement.dataset.sidebarCollapsed;
	}
}

export function persistSidebarCollapsedPreference(collapsed: boolean): void {
	syncSidebarCollapsedDocument(collapsed);
	try {
		window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? '1' : '0');
	} catch {
		// Ignore storage failures (private mode, quota, etc).
	}
}
