import type { DrawdownSummary, PerformanceSummary, StreakSummary } from '@shared/services';
import type { AccountOption } from '@shared/types';

/** JSON-serializable mirror of `EquityPoint` (dates as ISO strings, not `Date` instances). */
export interface AnalyticsEquityPoint {
	closedAt: string;
	equity: number;
	profitLoss: number;
}

/** JSON-serializable mirror of `DrawdownPoint`. */
export interface AnalyticsDrawdownPoint {
	closedAt: string;
	equity: number;
	profitLoss: number;
	peakEquity: number;
	drawdown: number;
	drawdownPercent: number;
}

/** JSON-serializable mirror of `DrawdownSummary`. */
export interface AnalyticsDrawdownSummary extends Omit<DrawdownSummary, 'points'> {
	points: AnalyticsDrawdownPoint[];
}

/** JSON-serializable mirror of `PeriodReturn`. */
export interface AnalyticsPeriodReturn {
	periodStart: string;
	periodKey: string;
	profitLoss: number;
	tradeCount: number;
	returnPercent: number | null;
}

export interface AnalyticsPeriodReturns {
	daily: AnalyticsPeriodReturn[];
	weekly: AnalyticsPeriodReturn[];
	monthly: AnalyticsPeriodReturn[];
}

export type AnalyticsPeriodGranularity = keyof AnalyticsPeriodReturns;

/**
 * The full, ready-to-render Analytics payload. Every number here is already computed by
 * `TradingCalculatorService` — components only format and display these values, they never
 * derive them.
 */
export interface AnalyticsData {
	hasAccounts: boolean;
	accounts: AccountOption[];
	activeAccountId: string | null;
	currency: string;
	startingBalance: number;
	currentBalance: number;
	performance: PerformanceSummary;
	streaks: StreakSummary;
	drawdown: AnalyticsDrawdownSummary;
	equityCurve: AnalyticsEquityPoint[];
	periodReturns: AnalyticsPeriodReturns;
	closedTradeCount: number;
}
