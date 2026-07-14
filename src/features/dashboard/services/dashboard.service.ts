import {
	tradeService,
	tradingAccountService,
	tradingCalculatorService,
	toFiniteNumber,
	type ClosedTradeResult,
	type EquityPoint,
} from '@shared/services';
import type { TradeClosedMetrics, TradeRecentSummary } from '@shared/repositories';
import { toAccountOption } from '@shared/utils/account-option';
import { dashboardCacheKey, cacheGet, cacheSet } from '@shared/lib/cache/page-data-cache';
import { riskRulesService } from '@features/risk/services/risk-rules.service';
import { EQUITY_CURVE_LOOKBACK_DAYS, RECENT_TRADES_LIMIT } from '../constants/dashboard.constants';
import type {
	DashboardData,
	DashboardDrawdownSummary,
	DashboardEquityPoint,
	DashboardRecentTrade,
} from '../types/dashboard.types';
import type { RiskAlertDto } from '@features/risk/types/risk.types';
import type { TradingAccount } from '@shared/types';

function toClosedTradeResult(row: TradeClosedMetrics): ClosedTradeResult | null {
	if (row.profitLoss === null || row.closedAt === null) {
		return null;
	}
	return {
		profitLoss: row.profitLoss,
		closedAt: row.closedAt,
		plannedRR: row.plannedRr,
		actualRR: row.actualRr,
		holdingTimeSeconds: row.holdingTimeSeconds,
	};
}

function serializeEquityPoint(point: EquityPoint): DashboardEquityPoint {
	return {
		closedAt: point.closedAt.toISOString(),
		equity: point.equity,
		profitLoss: point.profitLoss,
	};
}

function toFiniteNumberOrNull(value: string | null): number | null {
	if (value === null) {
		return null;
	}
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) ? parsed : null;
}

function toRecentTradeDto(row: TradeRecentSummary): DashboardRecentTrade {
	return {
		id: row.id,
		symbol: row.symbolTicker ?? 'Unknown',
		side: row.side,
		status: row.status,
		result: row.result,
		strategy: row.strategyName,
		profitLoss: toFiniteNumberOrNull(row.profitLoss),
		profitLossPercent: toFiniteNumberOrNull(row.profitLossPercent),
		actualRR: toFiniteNumberOrNull(row.actualRr),
		openedAt: row.openedAt ? row.openedAt.toISOString() : null,
		closedAt: row.closedAt ? row.closedAt.toISOString() : null,
	};
}

function emptyDashboard(): DashboardData {
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
		recentTrades: [],
		riskAlerts: [],
	};
}

function buildDashboardData(
	accounts: Awaited<ReturnType<typeof tradingAccountService.list>>,
	activeAccount: TradingAccount,
	closedMetrics: TradeClosedMetrics[],
	recentRows: TradeRecentSummary[],
	riskAlerts: RiskAlertDto[],
): DashboardData {
	const closedResults = closedMetrics
		.map(toClosedTradeResult)
		.filter((result): result is ClosedTradeResult => result !== null);

	const startingBalance = toFiniteNumber(activeAccount.startingBalance);
	const currentBalance = toFiniteNumber(activeAccount.currentBalance);
	const lookbackCutoff = new Date(Date.now() - EQUITY_CURVE_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
	const recentClosedResults = closedResults.filter((result) => {
		const closedAt = result.closedAt instanceof Date ? result.closedAt : new Date(result.closedAt ?? 0);
		return closedAt >= lookbackCutoff;
	});

	const performance = tradingCalculatorService.performanceSummary(closedResults);
	const streaks = tradingCalculatorService.streaks(closedResults);
	const drawdown = tradingCalculatorService.drawdown(startingBalance, closedResults);
	const equityCurve = tradingCalculatorService.equityCurve(startingBalance, recentClosedResults);

	return {
		hasAccounts: true,
		accounts: accounts.map(toAccountOption),
		activeAccountId: activeAccount.id,
		currency: activeAccount.currency,
		startingBalance,
		currentBalance,
		performance,
		streaks,
		drawdown: {
			...drawdown,
			points: [],
		} satisfies DashboardDrawdownSummary,
		equityCurve: equityCurve.map(serializeEquityPoint),
		recentTrades: recentRows.map(toRecentTradeDto),
		riskAlerts,
	};
}

async function assembleDashboard(
	userId: string,
	accounts: Awaited<ReturnType<typeof tradingAccountService.list>>,
	activeAccount: TradingAccount,
	closedMetrics: TradeClosedMetrics[],
	recentRows: TradeRecentSummary[],
): Promise<DashboardData> {
	const riskAlerts = await riskRulesService.evaluateForAccount(
		userId,
		activeAccount.id,
		toFiniteNumber(activeAccount.startingBalance),
		closedMetrics,
	);
	return buildDashboardData(accounts, activeAccount, closedMetrics, recentRows, riskAlerts);
}

export class DashboardService {
	async getDashboardData(userId: string, requestedAccountId?: string | null): Promise<DashboardData> {
		if (requestedAccountId) {
			const cached = await cacheGet<DashboardData>(dashboardCacheKey(userId, requestedAccountId));
			if (cached) {
				return {
					...cached,
					riskAlerts: cached.riskAlerts ?? [],
				};
			}

			const [accounts, closedMetrics, recentRows] = await Promise.all([
				tradingAccountService.list(userId),
				tradeService.listClosedMetricsByAccount(userId, requestedAccountId),
				tradeService.listRecentSummariesByAccount(userId, requestedAccountId, RECENT_TRADES_LIMIT),
			]);

			if (accounts.length === 0) {
				return emptyDashboard();
			}

			const activeAccount = accounts.find((account) => account.id === requestedAccountId);
			if (activeAccount) {
				const data = await assembleDashboard(userId, accounts, activeAccount, closedMetrics, recentRows);
				await cacheSet(dashboardCacheKey(userId, activeAccount.id), data);
				return data;
			}

			const fallback = accounts.find((account) => account.isDefault) ?? accounts[0];
			if (!fallback) {
				return emptyDashboard();
			}

			const [fallbackMetrics, fallbackRecent] = await Promise.all([
				tradeService.listClosedMetricsByAccount(userId, fallback.id),
				tradeService.listRecentSummariesByAccount(userId, fallback.id, RECENT_TRADES_LIMIT),
			]);
			const data = await assembleDashboard(userId, accounts, fallback, fallbackMetrics, fallbackRecent);
			await cacheSet(dashboardCacheKey(userId, fallback.id), data);
			return data;
		}

		const accounts = await tradingAccountService.list(userId);

		if (accounts.length === 0) {
			return emptyDashboard();
		}

		const activeAccount = accounts.find((account) => account.isDefault) ?? accounts[0];
		if (!activeAccount) {
			return emptyDashboard();
		}

		const cached = await cacheGet<DashboardData>(dashboardCacheKey(userId, activeAccount.id));
		if (cached) {
			return {
				...cached,
				accounts: accounts.map(toAccountOption),
				activeAccountId: activeAccount.id,
				riskAlerts: cached.riskAlerts ?? [],
			};
		}

		const [closedMetrics, recentRows] = await Promise.all([
			tradeService.listClosedMetricsByAccount(userId, activeAccount.id),
			tradeService.listRecentSummariesByAccount(userId, activeAccount.id, RECENT_TRADES_LIMIT),
		]);

		const data = await assembleDashboard(userId, accounts, activeAccount, closedMetrics, recentRows);
		await cacheSet(dashboardCacheKey(userId, activeAccount.id), data);
		return data;
	}
}

export const dashboardService = new DashboardService();
