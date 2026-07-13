import type { LucideIcon } from 'lucide-react';
import { cn } from '@shared/utils/cn';

export type StatTrend = 'up' | 'down' | 'neutral';

interface StatCardProps {
	label: string;
	value: string;
	subtext?: string;
	trend?: StatTrend;
	icon: LucideIcon;
	index?: number;
}

const TREND_CLASS: Record<StatTrend, string> = {
	up: 'text-success',
	down: 'text-danger',
	neutral: 'text-muted',
};

export function StatCard({ label, value, subtext, trend = 'neutral', icon: Icon }: StatCardProps) {
	return (
		<div className="glass-card flex h-full flex-col gap-3 p-5 transition-transform duration-200 hover:-translate-y-0.5">
			<div className="flex items-center justify-between gap-3">
				<span className="text-sm font-medium text-muted">{label}</span>
				<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
					<Icon className="size-4.5" aria-hidden="true" />
				</div>
			</div>
			<p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
			{subtext ? <p className={cn('mt-auto text-xs font-medium', TREND_CLASS[trend])}>{subtext}</p> : null}
		</div>
	);
}
