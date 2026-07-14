import type { NavItem } from '@shared/types';

/** Primary app navigation, shared by every authenticated feature's `AppShell`. */
export const NAV_ITEMS: NavItem[] = [
	{ id: 'dashboard', label: 'Dashboard', href: '/app', icon: 'dashboard', enabled: true },
	{ id: 'trades', label: 'Trades', href: '/app/trades', icon: 'trades', enabled: true },
	{ id: 'analytics', label: 'Analytics', href: '/app/analytics', icon: 'analytics', enabled: true },
	{ id: 'calendar', label: 'Calendar', href: '/app/calendar', icon: 'calendar', enabled: true },
	{ id: 'goals', label: 'Goals', href: '/app/goals', icon: 'goals', enabled: true },
	{ id: 'notes', label: 'Notes', href: '/app/notes', icon: 'notes', enabled: true },
	{ id: 'shared', label: 'Shared', href: '/app/shared', icon: 'shared', enabled: true },
	{ id: 'settings', label: 'Settings', href: '/app/settings', icon: 'settings', enabled: true },
];
