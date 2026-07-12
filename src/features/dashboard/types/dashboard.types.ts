import type { DrawdownSummary, PerformanceSummary, StreakSummary, TradeDirection } from '@shared/services';
import type { AccountOption, TradeResult, TradeStatus } from '@shared/types';


export interface DashboardEquityPoint {
	closedAt: string;
	equity: number;
	profitLoss: number;
}

export interface DashboardDrawdownSummary extends Omit<DrawdownSummary, 'points'> {
	points: Array<Omit<DrawdownSummary['points'][number], 'closedAt'> & { closedAt: string }>;
}

export interface DashboardRecentTrade {
	id: string;
	symbol: string;
	side: TradeDirection;
	status: TradeStatus;
	result: TradeResult | null;
	strategy: string | null;
	profitLoss: number | null;
	profitLossPercent: number | null;
	actualRR: number | null;
	openedAt: string | null;
	closedAt: string | null;
}


export interface DashboardData {
	hasAccounts: boolean;
	accounts: AccountOption[];
	activeAccountId: string | null;
	currency: string;
	startingBalance: number;
	currentBalance: number;
	performance: PerformanceSummary;
	streaks: StreakSummary;
	drawdown: DashboardDrawdownSummary;
	equityCurve: DashboardEquityPoint[];
	recentTrades: DashboardRecentTrade[];
}
