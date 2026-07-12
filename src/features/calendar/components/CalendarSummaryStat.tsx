import type { LucideIcon } from 'lucide-react';
import { cn } from '@shared/utils/cn';

type StatTone = 'success' | 'danger' | 'primary' | 'muted';

interface CalendarSummaryStatProps {
	label: string;
	value: string;
	tone: StatTone;
	icon: LucideIcon;
}

const TONE_TEXT_CLASS: Record<StatTone, string> = {
	success: 'text-success',
	danger: 'text-danger',
	primary: 'text-primary',
	muted: 'text-foreground',
};

const TONE_ICON_WRAP_CLASS: Record<StatTone, string> = {
	success: 'bg-success/10 text-success',
	danger: 'bg-danger/10 text-danger',
	primary: 'bg-primary/10 text-primary',
	muted: 'bg-white/8 text-muted',
};

/** Single stat tile used by `CalendarHeader`'s month-summary row. Purely presentational. */
export function CalendarSummaryStat({ label, value, tone, icon: Icon }: CalendarSummaryStatProps) {
	return (
		<div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
			<div className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', TONE_ICON_WRAP_CLASS[tone])}>
				<Icon className="size-4.5" aria-hidden="true" />
			</div>
			<div className="min-w-0">
				<p className="truncate text-xs font-medium text-muted">{label}</p>
				<p className={cn('text-lg font-semibold tracking-tight', TONE_TEXT_CLASS[tone])}>{value}</p>
			</div>
		</div>
	);
}
