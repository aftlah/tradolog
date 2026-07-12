import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@shared/utils/cn';

export type MetricTrend = 'up' | 'down' | 'neutral';

interface AnalyticsMetricCardProps {
	label: string;
	value: string;
	subtext?: string;
	trend?: MetricTrend;
	icon: LucideIcon;
	index?: number;
}

const TREND_CLASS: Record<MetricTrend, string> = {
	up: 'text-success',
	down: 'text-danger',
	neutral: 'text-muted',
};

/** Compact statistic card reused across the Analytics grid — presentational only. */
export function AnalyticsMetricCard({ label, value, subtext, trend = 'neutral', icon: Icon, index = 0 }: AnalyticsMetricCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.25, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
			whileHover={{ y: -2 }}
			className="glass-card flex flex-col gap-3 p-5"
		>
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium text-muted">{label}</span>
				<div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
					<Icon className="size-4.5" aria-hidden="true" />
				</div>
			</div>
			<p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
			{subtext ? <p className={cn('text-xs font-medium', TREND_CLASS[trend])}>{subtext}</p> : null}
		</motion.div>
	);
}
