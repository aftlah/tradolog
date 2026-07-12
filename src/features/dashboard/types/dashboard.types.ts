import type { DrawdownSummary, PerformanceSummary, StreakSummary, TradeDirection } from '@shared/services';
import type { AccountType, TradeResult, TradeStatus } from '@shared/types';

export interface DashboardAccountOption {
	id: string;
	name: string;
	broker: string | null;
	accountType: AccountType;
	currency: string;
	isDefault: boolean;
	startingBalance: number;
	currentBalance: number;
}

/** JSON-serializable mirror of `EquityPoint` (dates as ISO strings, not `Date` instances). */
export interface DashboardEquityPoint {
	closedAt: string;
	equity: number;
	profitLoss: number;
}

/** JSON-serializable mirror of `DrawdownSummary`. */
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

/**
 * The full, ready-to-render Dashboard payload. Every number here is already computed by
 * `TradingCalculatorService` — components only format and display these values, they never
 * derive them.
 */
export interface DashboardData {
	hasAccounts: boolean;
	accounts: DashboardAccountOption[];
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

export interface NavItem {
	id: string;
	label: string;
	href: string;
	icon: 'dashboard' | 'trades' | 'analytics' | 'calendar' | 'goals' | 'notes' | 'settings';
	enabled: boolean;
}
