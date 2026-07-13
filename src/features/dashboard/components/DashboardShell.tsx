import { AppShell, NoAccountsEmptyState } from '@shared/components';
import { LogoutButton } from '@features/auth/components/LogoutButton';
import { useDashboardData } from '../hooks/useDashboardData';
import type { DashboardData } from '../types/dashboard.types';
import { StatCardsGrid } from './StatCardsGrid';
import { LazyEquityCurveCard } from './LazyEquityCurveCard';
import { PerformanceSummaryCard } from './PerformanceSummaryCard';
import { RecentTradesTable } from './RecentTradesTable';

interface DashboardShellProps {
	initialData: DashboardData;
	userName: string;
	userEmail: string;
}

/**
 * Top-level Dashboard orchestrator. Owns account-switching state; every child component is
 * purely presentational and receives already-computed data as props. Navigation chrome comes
 * from the shared `AppShell` so it never drifts from the Trade Journal's shell.
 */
export function DashboardShell({ initialData, userName, userEmail }: DashboardShellProps) {
	const { data, isLoading, switchAccount } = useDashboardData(initialData);

	return (
		<AppShell
			title="Dashboard"
			activeHref="/app"
			userName={userName}
			userEmail={userEmail}
			accounts={data.accounts}
			activeAccountId={data.activeAccountId}
			onAccountChange={switchAccount}
			isLoadingAccount={isLoading}
			userMenuFooter={<LogoutButton className="w-full" />}
		>
			{!data.hasAccounts ? (
				<NoAccountsEmptyState description="Your dashboard will come alive as soon as you add a trading account and start logging trades. Account management ships in an upcoming feature." />
			) : (
				<>
					<StatCardsGrid data={data} />

					<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
						<div className="lg:col-span-2">
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
				</>
			)}
		</AppShell>
	);
}
