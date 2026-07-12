/** A single entry in the primary app navigation (desktop sidebar + mobile slide-over). */
export interface NavItem {
	id: string;
	label: string;
	href: string;
	icon: 'dashboard' | 'trades' | 'analytics' | 'calendar' | 'goals' | 'notes' | 'settings';
	enabled: boolean;
}
