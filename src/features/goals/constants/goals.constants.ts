import type { GoalStatus } from '@shared/types';

export const GOALS_API_ROUTE = '/api/goals';

type BadgeVariant = 'success' | 'danger' | 'muted' | 'warning' | 'primary';

export const GOAL_STATUS_OPTIONS: Array<{ value: GoalStatus; label: string }> = [
	{ value: 'active', label: 'Active' },
	{ value: 'completed', label: 'Completed' },
	{ value: 'missed', label: 'Missed' },
	{ value: 'cancelled', label: 'Cancelled' },
];

export const GOAL_STATUS_BADGE: Record<GoalStatus, { label: string; variant: BadgeVariant }> = {
	active: { label: 'Active', variant: 'primary' },
	completed: { label: 'Completed', variant: 'success' },
	missed: { label: 'Missed', variant: 'danger' },
	cancelled: { label: 'Cancelled', variant: 'muted' },
};

export const MONTH_OPTIONS: Array<{ value: number; label: string }> = [
	{ value: 1, label: 'January' },
	{ value: 2, label: 'February' },
	{ value: 3, label: 'March' },
	{ value: 4, label: 'April' },
	{ value: 5, label: 'May' },
	{ value: 6, label: 'June' },
	{ value: 7, label: 'July' },
	{ value: 8, label: 'August' },
	{ value: 9, label: 'September' },
	{ value: 10, label: 'October' },
	{ value: 11, label: 'November' },
	{ value: 12, label: 'December' },
];

export const MONTH_LABELS: Record<number, string> = MONTH_OPTIONS.reduce(
	(labels, option) => ({ ...labels, [option.value]: option.label }),
	{} as Record<number, string>,
);
