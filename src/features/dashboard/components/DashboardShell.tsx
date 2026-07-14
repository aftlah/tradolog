import { lazy, Suspense, useEffect } from 'react';
import { NoAccountsEmptyState } from '@shared/components';
import { subscribeClientAccountSwitch } from '@shared/utils/account-switch-events';
import { useDashboardData } from '../hooks/useDashboardData';
import type { DashboardData } from '../types/dashboard.types';
import { StatCardsGrid } from './StatCardsGrid';
import { PerformanceSummaryCard } from './PerformanceSummaryCard';
import { RecentTradesTable } from './RecentTradesTable';
import { RiskAlertsCard } from './RiskAlertsCard';

const EquityCurveCard = lazy(() =>
	import('./EquityCurveCard').then((module) => ({ default: module.EquityCurveCard })),
);

interface DashboardShellProps {
	initialData: DashboardData;
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

/** Dashboard page body — chrome lives in the persisted `AppLayout` shell. */
export function DashboardShell({ initialData }: DashboardShellProps) {
	const { data, switchAccount } = useDashboardData(initialData);

	useEffect(() => subscribeClientAccountSwitch(switchAccount), [switchAccount]);

	if (!data.hasAccounts) {
		return (
			<NoAccountsEmptyState description="Your dashboard will come alive as soon as you add a trading account and start logging trades. Account management ships in an upcoming feature." />
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<RiskAlertsCard alerts={data.riskAlerts} currency={data.currency} />

			<StatCardsGrid data={data} />

			<div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
				<div className="min-h-72 lg:col-span-2">
					<Suspense fallback={<ChartSkeleton label="equity curve" />}>
						<EquityCurveCard
							equityCurve={data.equityCurve}
							startingBalance={data.startingBalance}
							currency={data.currency}
						/>
					</Suspense>
				</div>
				<PerformanceSummaryCard
					performance={data.performance}
					streaks={data.streaks}
					maxDrawdown={data.drawdown.maxDrawdown}
					currency={data.currency}
				/>
			</div>

			<RecentTradesTable trades={data.recentTrades} currency={data.currency} />
		</div>
	);
}
