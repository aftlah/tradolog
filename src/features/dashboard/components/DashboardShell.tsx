import { useState } from 'react';
import { NAV_ITEMS } from '../constants/dashboard.constants';
import { useDashboardData } from '../hooks/useDashboardData';
import type { DashboardData } from '../types/dashboard.types';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { StatCardsGrid } from './StatCardsGrid';
import { EquityCurveCard } from './EquityCurveCard';
import { PerformanceSummaryCard } from './PerformanceSummaryCard';
import { RecentTradesTable } from './RecentTradesTable';
import { DashboardEmptyState } from './DashboardEmptyState';

interface DashboardShellProps {
	initialData: DashboardData;
	userName: string;
	userEmail: string;
}

/**
 * Top-level Dashboard orchestrator. Owns the mobile-nav toggle and account-switching state;
 * every child component is purely presentational and receives already-computed data as props.
 */
export function DashboardShell({ initialData, userName, userEmail }: DashboardShellProps) {
	const [mobileNavOpen, setMobileNavOpen] = useState(false);
	const { data, isLoading, switchAccount } = useDashboardData(initialData);

	return (
		<div className="relative min-h-dvh">
			<div
				aria-hidden="true"
				className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgb(37_99_235_/_0.14),_transparent_55%)]"
			/>

			<Sidebar
				navItems={NAV_ITEMS}
				activeHref="/app"
				mobileOpen={mobileNavOpen}
				onMobileOpenChange={setMobileNavOpen}
			/>

			<div className="relative z-10 lg:pl-[18rem]">
				<div className="px-4 pt-4 lg:pr-4">
					<Navbar
						title="Dashboard"
						userName={userName}
						userEmail={userEmail}
						accounts={data.accounts}
						activeAccountId={data.activeAccountId}
						onAccountChange={switchAccount}
						onOpenMobileNav={() => setMobileNavOpen(true)}
						isLoadingAccount={isLoading}
					/>
				</div>

				<main className="space-y-6 px-4 py-6 lg:pr-4">
					{!data.hasAccounts ? (
						<DashboardEmptyState />
					) : (
						<>
							<StatCardsGrid data={data} />

							<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
								<div className="lg:col-span-2">
									<EquityCurveCard
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
				</main>
			</div>
		</div>
	);
}
