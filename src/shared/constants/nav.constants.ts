import type { NavItem } from '@shared/types';

/** Primary app navigation, shared by every authenticated feature's `AppShell`. */
export const NAV_ITEMS: NavItem[] = [
	{ id: 'dashboard', label: 'Dashboard', href: '/app', icon: 'dashboard', enabled: true },
	{ id: 'trades', label: 'Trades', href: '/app/trades', icon: 'trades', enabled: true },
	{ id: 'analytics', label: 'Analytics', href: '/app/analytics', icon: 'analytics', enabled: false },
	{ id: 'calendar', label: 'Calendar', href: '/app/calendar', icon: 'calendar', enabled: false },
	{ id: 'goals', label: 'Goals', href: '/app/goals', icon: 'goals', enabled: false },
	{ id: 'notes', label: 'Notes', href: '/app/notes', icon: 'notes', enabled: false },
	{ id: 'settings', label: 'Settings', href: '/app/settings', icon: 'settings', enabled: false },
];
