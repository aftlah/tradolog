/**
 * AnalyticsService
 *
 * Composes the domain repositories/services with `TradingCalculatorService` to produce a
 * single, ready-to-render `AnalyticsData` payload. Per the project rules, the UI must never
 * calculate statistics itself — every number in `AnalyticsData` is already computed here.
 *
 * UI → AnalyticsService → (TradingAccountService / TradeService) → Repository → Database
 */
import {
	tradeService,
	tradingAccountService,
	tradingCalculatorService,
	toFiniteNumber,
	type ClosedTradeResult,
	type DrawdownPoint,
	type EquityPoint,
	type PeriodReturn,
} from '@shared/services';
import type { Trade } from '@shared/types';
import { toAccountOption } from '@shared/utils/account-option';
import {
	DAILY_RETURNS_LOOKBACK,
	MONTHLY_RETURNS_LOOKBACK,
	WEEKLY_RETURNS_LOOKBACK,
} from '../constants/analytics.constants';
import type {
	AnalyticsData,
	AnalyticsDrawdownPoint,
	AnalyticsDrawdownSummary,
	AnalyticsEquityPoint,
	AnalyticsPeriodReturn,
} from '../types/analytics.types';

function toClosedTradeResult(trade: Trade): ClosedTradeResult {
	return {
		profitLoss: trade.profitLoss,
		closedAt: trade.closedAt,
		plannedRR: trade.plannedRr,
		actualRR: trade.actualRr,
		holdingTimeSeconds: trade.holdingTimeSeconds,
	};
}

function serializeEquityPoint(point: EquityPoint): AnalyticsEquityPoint {
	return {
		closedAt: point.closedAt.toISOString(),
		equity: point.equity,
		profitLoss: point.profitLoss,
	};
}

function serializeDrawdownPoint(point: DrawdownPoint): AnalyticsDrawdownPoint {
	return {
		closedAt: point.closedAt.toISOString(),
		equity: point.equity,
		profitLoss: point.profitLoss,
		peakEquity: point.peakEquity,
		drawdown: point.drawdown,
		drawdownPercent: point.drawdownPercent,
	};
}

function serializePeriodReturn(period: PeriodReturn): AnalyticsPeriodReturn {
	return {
		periodStart: period.periodStart.toISOString(),
		periodKey: period.periodKey,
		profitLoss: period.profitLoss,
		tradeCount: period.tradeCount,
		returnPercent: period.returnPercent,
	};
}

function emptyAnalytics(): AnalyticsData {
	const emptyPerformance = tradingCalculatorService.performanceSummary([]);
	const emptyStreaks = tradingCalculatorService.streaks([]);
	const emptyDrawdown = tradingCalculatorService.drawdown(0, []);

	return {
		hasAccounts: false,
		accounts: [],
		activeAccountId: null,
		currency: 'USD',
		startingBalance: 0,
		currentBalance: 0,
		performance: emptyPerformance,
		streaks: emptyStreaks,
		drawdown: { ...emptyDrawdown, points: [] },
		equityCurve: [],
		periodReturns: { daily: [], weekly: [], monthly: [] },
		closedTradeCount: 0,
	};
}

export class AnalyticsService {
	/**
	 * Builds the complete analytics payload for `userId`, scoped to `requestedAccountId` when
	 * provided and owned by the user, otherwise the user's default (or first) trading account.
	 */
	async getAnalyticsData(userId: string, requestedAccountId?: string | null): Promise<AnalyticsData> {
		const accounts = await tradingAccountService.list(userId);

		if (accounts.length === 0) {
			return emptyAnalytics();
		}

		const activeAccount =
			(requestedAccountId ? accounts.find((account) => account.id === requestedAccountId) : undefined) ??
			accounts.find((account) => account.isDefault) ??
			accounts[0];

		if (!activeAccount) {
			return emptyAnalytics();
		}

		const allTrades = await tradeService.list(userId);
		const accountTrades = allTrades.filter((trade) => trade.accountId === activeAccount.id);
		const closedTrades = accountTrades.filter(
			(trade) => trade.status === 'closed' && trade.profitLoss !== null && trade.closedAt !== null,
		);
		const closedResults = closedTrades.map(toClosedTradeResult);

		const startingBalance = toFiniteNumber(activeAccount.startingBalance);

		const performance = tradingCalculatorService.performanceSummary(closedResults);
		const streaks = tradingCalculatorService.streaks(closedResults);
		const drawdown = tradingCalculatorService.drawdown(startingBalance, closedResults);
		const equityCurve = tradingCalculatorService.equityCurve(startingBalance, closedResults);

		const dailyReturns = tradingCalculatorService.dailyReturns(closedResults, startingBalance);
		const weeklyReturns = tradingCalculatorService.weeklyReturns(closedResults, startingBalance);
		const monthlyReturns = tradingCalculatorService.monthlyReturns(closedResults, startingBalance);

		return {
			hasAccounts: true,
			accounts: accounts.map(toAccountOption),
			activeAccountId: activeAccount.id,
			currency: activeAccount.currency,
			startingBalance,
			currentBalance: toFiniteNumber(activeAccount.currentBalance),
			performance,
			streaks,
			drawdown: {
				...drawdown,
				points: drawdown.points.map(serializeDrawdownPoint),
			} satisfies AnalyticsDrawdownSummary,
			equityCurve: equityCurve.map(serializeEquityPoint),
			periodReturns: {
				daily: dailyReturns.slice(-DAILY_RETURNS_LOOKBACK).map(serializePeriodReturn),
				weekly: weeklyReturns.slice(-WEEKLY_RETURNS_LOOKBACK).map(serializePeriodReturn),
				monthly: monthlyReturns.slice(-MONTHLY_RETURNS_LOOKBACK).map(serializePeriodReturn),
			},
			closedTradeCount: closedResults.length,
		};
	}
}

export const analyticsService = new AnalyticsService();
