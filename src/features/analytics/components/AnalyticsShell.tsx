import { NoAccountsEmptyState } from '@shared/components';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import type { AnalyticsData } from '../types/analytics.types';
import { AnalyticsStatGrid } from './AnalyticsStatGrid';
import {
	LazyAnalyticsDrawdownCard,
	LazyAnalyticsEquityChart,
	LazyAnalyticsPeriodReturnsCard,
} from './LazyAnalyticsCharts';
import { AnalyticsStreaksCard } from './AnalyticsStreaksCard';

interface AnalyticsShellProps {
	initialData: AnalyticsData;
}

/** Analytics page body — chrome lives in the persisted `AppLayout` shell. */
export function AnalyticsShell({ initialData }: AnalyticsShellProps) {
	const { data, isLoading } = useAnalyticsData(initialData);

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
					<LazyAnalyticsEquityChart
						equityCurve={data.equityCurve}
						startingBalance={data.startingBalance}
						currency={data.currency}
					/>
				</div>
				<AnalyticsStreaksCard streaks={data.streaks} />
			</div>

			<div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
				<div className="min-h-72 lg:col-span-2">
					<LazyAnalyticsPeriodReturnsCard periodReturns={data.periodReturns} currency={data.currency} />
				</div>
				<LazyAnalyticsDrawdownCard drawdown={data.drawdown} currency={data.currency} />
			</div>

			{isLoading ? <p className="text-center text-xs text-muted">Refreshing analytics…</p> : null}
		</div>
	);
}
