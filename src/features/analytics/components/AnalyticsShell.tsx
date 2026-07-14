import { lazy, Suspense, useEffect } from 'react';
import { NoAccountsEmptyState } from '@shared/components';
import { subscribeClientAccountSwitch } from '@shared/utils/account-switch-events';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import type { AnalyticsData } from '../types/analytics.types';
import { AnalyticsStatGrid } from './AnalyticsStatGrid';
import { AnalyticsStreaksCard } from './AnalyticsStreaksCard';

const AnalyticsEquityChart = lazy(() =>
	import('./AnalyticsEquityChart').then((module) => ({ default: module.AnalyticsEquityChart })),
);
const AnalyticsPeriodReturnsCard = lazy(() =>
	import('./AnalyticsPeriodReturnsCard').then((module) => ({ default: module.AnalyticsPeriodReturnsCard })),
);
const AnalyticsDrawdownCard = lazy(() =>
	import('./AnalyticsDrawdownCard').then((module) => ({ default: module.AnalyticsDrawdownCard })),
);

interface AnalyticsShellProps {
	initialData: AnalyticsData;
}

function ChartSkeleton({ label }: { label: string }) {
	return (
		<div
			className="glass-card flex h-full min-h-72 min-w-0 flex-col gap-4 p-6"
			aria-busy="true"
			aria-label={`Loading ${label}`}
		>
			<div className="h-4 w-28 animate-pulse rounded bg-white/10" />
			<div className="h-5 w-48 animate-pulse rounded bg-white/8" />
			<div className="mt-4 flex-1 animate-pulse rounded-2xl bg-white/5" />
		</div>
	);
}

/** Analytics page body — chrome lives in the persisted `AppLayout` shell. */
export function AnalyticsShell({ initialData }: AnalyticsShellProps) {
	const { data, isLoading, switchAccount } = useAnalyticsData(initialData);

	useEffect(() => subscribeClientAccountSwitch(switchAccount), [switchAccount]);

	if (!data.hasAccounts) {
		return (
			<NoAccountsEmptyState description="Your analytics will come alive as soon as you add a trading account and start logging trades. Account management ships in an upcoming feature." />
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<AnalyticsStatGrid performance={data.performance} currency={data.currency} />

			<div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
				<div className="min-h-72 lg:col-span-2">
					<Suspense fallback={<ChartSkeleton label="equity curve" />}>
						<AnalyticsEquityChart
							equityCurve={data.equityCurve}
							startingBalance={data.startingBalance}
							currency={data.currency}
						/>
					</	Suspense>
				</div>
				<AnalyticsStreaksCard streaks={data.streaks} />
			</div>

			<div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
				<div className="min-h-72 lg:col-span-2">
					<Suspense fallback={<ChartSkeleton label="period returns" />}>
						<AnalyticsPeriodReturnsCard periodReturns={data.periodReturns} currency={data.currency} />
					</Suspense>
				</div>
				<Suspense fallback={<ChartSkeleton label="drawdown" />}>
					<AnalyticsDrawdownCard drawdown={data.drawdown} currency={data.currency} />
				</Suspense>
			</div>

			{isLoading ? <p className="text-center text-xs text-muted">Refreshing analytics…</p> : null}
		</div>
	);
}
