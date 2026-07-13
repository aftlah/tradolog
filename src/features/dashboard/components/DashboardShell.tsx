import { NoAccountsEmptyState } from '@shared/components';
import { useDashboardData } from '../hooks/useDashboardData';
import type { DashboardData } from '../types/dashboard.types';
import { StatCardsGrid } from './StatCardsGrid';
import { LazyEquityCurveCard } from './LazyEquityCurveCard';
import { PerformanceSummaryCard } from './PerformanceSummaryCard';
import { RecentTradesTable } from './RecentTradesTable';

interface DashboardShellProps {
	initialData: DashboardData;
}

/** Dashboard page body — chrome lives in the persisted `AppLayout` shell. */
export function DashboardShell({ initialData }: DashboardShellProps) {
	const { data } = useDashboardData(initialData);

	if (!data.hasAccounts) {
		return (
			<NoAccountsEmptyState description="Your dashboard will come alive as soon as you add a trading account and start logging trades. Account management ships in an upcoming feature." />
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<StatCardsGrid data={data} />

			<div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
				<div className="min-h-72 lg:col-span-2">
					<LazyEquityCurveCard
						equityCurve={data.equityCurve}
						startingBalance={data.startingBalance}
						currency={data.currency}
					/>
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
