import type { NavItem } from '../types/dashboard.types';

export const RECENT_TRADES_LIMIT = 8;

/** Number of days of realized equity history plotted on the dashboard equity curve. */
export const EQUITY_CURVE_LOOKBACK_DAYS = 90;

export const NAV_ITEMS: NavItem[] = [
	{ id: 'dashboard', label: 'Dashboard', href: '/app', icon: 'dashboard', enabled: true },
	{ id: 'trades', label: 'Trades', href: '/app/trades', icon: 'trades', enabled: false },
	{ id: 'analytics', label: 'Analytics', href: '/app/analytics', icon: 'analytics', enabled: false },
	{ id: 'calendar', label: 'Calendar', href: '/app/calendar', icon: 'calendar', enabled: false },
	{ id: 'goals', label: 'Goals', href: '/app/goals', icon: 'goals', enabled: false },
	{ id: 'notes', label: 'Notes', href: '/app/notes', icon: 'notes', enabled: false },
	{ id: 'settings', label: 'Settings', href: '/app/settings', icon: 'settings', enabled: false },
];

export const DASHBOARD_API_ROUTE = '/api/dashboard/data';
