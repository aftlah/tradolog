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
	success: 'text-emerald-300',
	danger: 'text-rose-300',
	primary: 'text-primary',
	muted: 'text-foreground',
};

const TONE_ICON_WRAP_CLASS: Record<StatTone, string> = {
	success: 'border border-emerald-400/25 bg-emerald-400/12 text-emerald-300 shadow-[0_0_18px_rgb(52_211_153_/_0.12)]',
	danger: 'border border-rose-400/25 bg-rose-400/12 text-rose-300 shadow-[0_0_18px_rgb(251_113_133_/_0.12)]',
	primary: 'bg-primary/10 text-primary',
	muted: 'bg-white/8 text-muted',
};

const TONE_CARD_CLASS: Record<StatTone, string> = {
	success: 'border-emerald-400/15 bg-emerald-400/[0.04]',
	danger: 'border-rose-400/15 bg-rose-400/[0.04]',
	primary: 'border-white/8 bg-white/[0.03]',
	muted: 'border-white/8 bg-white/[0.03]',
};

export function CalendarSummaryStat({ label, value, tone, icon: Icon }: CalendarSummaryStatProps) {
	return (
		<div className={cn('flex items-center gap-3 rounded-2xl border p-4', TONE_CARD_CLASS[tone])}>
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
