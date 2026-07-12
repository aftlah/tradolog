import { FeaturePageShell, NoAccountsEmptyState } from '@shared/components';
import { LogoutButton } from '@features/auth/components/LogoutButton';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import type { AnalyticsData } from '../types/analytics.types';
import { AnalyticsStatGrid } from './AnalyticsStatGrid';
import { AnalyticsEquityChart } from './AnalyticsEquityChart';
import { AnalyticsPeriodReturnsCard } from './AnalyticsPeriodReturnsCard';
import { AnalyticsStreaksCard } from './AnalyticsStreaksCard';
import { AnalyticsDrawdownCard } from './AnalyticsDrawdownCard';

interface AnalyticsShellProps {
	initialData: AnalyticsData;
	userName: string;
	userEmail: string;
}

/**
 * Top-level Analytics orchestrator. Owns account-switching state; every child component is
 * purely presentational and receives already-computed data as props. Navigation chrome comes
 * from the shared `FeaturePageShell` so it never drifts from the rest of the app.
 */
export function AnalyticsShell({ initialData, userName, userEmail }: AnalyticsShellProps) {
	const { data, isLoading, switchAccount } = useAnalyticsData(initialData);

	return (
		<FeaturePageShell
			title="Analytics"
			activeHref="/app/analytics"
			userName={userName}
			userEmail={userEmail}
			accounts={data.accounts}
			activeAccountId={data.activeAccountId}
			onAccountChange={switchAccount}
			userMenuFooter={<LogoutButton className="w-full" />}
		>
			{!data.hasAccounts ? (
				<NoAccountsEmptyState description="Your analytics will come alive as soon as you add a trading account and start logging trades. Account management ships in an upcoming feature." />
			) : (
				<>
					<AnalyticsStatGrid performance={data.performance} currency={data.currency} />

					<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
						<div className="lg:col-span-2">
							<AnalyticsEquityChart
								equityCurve={data.equityCurve}
								startingBalance={data.startingBalance}
								currency={data.currency}
							/>
						</div>
						<AnalyticsStreaksCard streaks={data.streaks} />
					</div>

					<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
						<div className="lg:col-span-2">
							<AnalyticsPeriodReturnsCard periodReturns={data.periodReturns} currency={data.currency} />
						</div>
						<AnalyticsDrawdownCard drawdown={data.drawdown} currency={data.currency} />
					</div>

					{isLoading ? <p className="text-center text-xs text-muted">Refreshing analytics…</p> : null}
				</>
			)}
		</FeaturePageShell>
	);
}
