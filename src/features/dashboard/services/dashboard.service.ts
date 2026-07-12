
import {
	strategyService,
	symbolService,
	tradeService,
	tradingAccountService,
	tradingCalculatorService,
	computeCurrentBalance,
	toFiniteNumber,
	type ClosedTradeResult,
	type EquityPoint,
} from '@shared/services';
import type { Trade, TradeSymbol } from '@shared/types';
import { toAccountOption } from '@shared/utils/account-option';
import { EQUITY_CURVE_LOOKBACK_DAYS, RECENT_TRADES_LIMIT } from '../constants/dashboard.constants';
import type {
	DashboardData,
	DashboardDrawdownSummary,
	DashboardEquityPoint,
	DashboardRecentTrade,
} from '../types/dashboard.types';

function toClosedTradeResult(trade: Trade): ClosedTradeResult {
	return {
		profitLoss: trade.profitLoss,
		closedAt: trade.closedAt,
		plannedRR: trade.plannedRr,
		actualRR: trade.actualRr,
		holdingTimeSeconds: trade.holdingTimeSeconds,
	};
}

function serializeEquityPoint(point: EquityPoint): DashboardEquityPoint {
	return {
		closedAt: point.closedAt.toISOString(),
		equity: point.equity,
		profitLoss: point.profitLoss,
	};
}

function toRecentTradeDto(trade: Trade, symbolMap: Map<string, TradeSymbol>, strategyMap: Map<string, string>): DashboardRecentTrade {
	return {
		id: trade.id,
		symbol: symbolMap.get(trade.symbolId)?.ticker ?? 'Unknown',
		side: trade.side,
		status: trade.status,
		result: trade.result,
		strategy: trade.strategyId ? strategyMap.get(trade.strategyId) ?? null : null,
		profitLoss: toFiniteNumberOrNull(trade.profitLoss),
		profitLossPercent: toFiniteNumberOrNull(trade.profitLossPercent),
		actualRR: toFiniteNumberOrNull(trade.actualRr),
		openedAt: trade.openedAt ? trade.openedAt.toISOString() : null,
		closedAt: trade.closedAt ? trade.closedAt.toISOString() : null,
	};
}

function toFiniteNumberOrNull(value: string | null): number | null {
	if (value === null) {
		return null;
	}
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) ? parsed : null;
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
	};
}

export class DashboardService {

	async getDashboardData(userId: string, requestedAccountId?: string | null): Promise<DashboardData> {
		const accounts = await tradingAccountService.list(userId);

		if (accounts.length === 0) {
			return emptyDashboard();
		}

		const activeAccount =
			(requestedAccountId ? accounts.find((account) => account.id === requestedAccountId) : undefined) ??
			accounts.find((account) => account.isDefault) ??
			accounts[0];

		if (!activeAccount) {
			return emptyDashboard();
		}

		const [allTrades, symbols, strategies] = await Promise.all([
			tradeService.list(userId),
			symbolService.listForUser(userId),
			strategyService.list(userId),
		]);

		const symbolMap = new Map(symbols.map((symbol) => [symbol.id, symbol]));
		const strategyMap = new Map(strategies.map((strategy) => [strategy.id, strategy.name]));

		const accountTrades = allTrades.filter((trade) => trade.accountId === activeAccount.id);
		const closedTrades = accountTrades.filter(
			(trade) => trade.status === 'closed' && trade.profitLoss !== null && trade.closedAt !== null,
		);
		const closedResults = closedTrades.map(toClosedTradeResult);

		const startingBalance = toFiniteNumber(activeAccount.startingBalance);
		const currentBalance = computeCurrentBalance(
			startingBalance,
			closedResults.map((result) => result.profitLoss),
		);
		const lookbackCutoff = new Date(Date.now() - EQUITY_CURVE_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
		const recentClosedResults = closedResults.filter((result) => {
			const closedAt = result.closedAt instanceof Date ? result.closedAt : new Date(result.closedAt ?? 0);
			return closedAt >= lookbackCutoff;
		});

		const performance = tradingCalculatorService.performanceSummary(closedResults);
		const streaks = tradingCalculatorService.streaks(closedResults);
		const drawdown = tradingCalculatorService.drawdown(startingBalance, closedResults);
		const equityCurve = tradingCalculatorService.equityCurve(startingBalance, recentClosedResults);

		const recentTrades = [...accountTrades]
			.sort((a, b) => {
				const aTime = (a.closedAt ?? a.openedAt ?? a.createdAt).getTime();
				const bTime = (b.closedAt ?? b.openedAt ?? b.createdAt).getTime();
				return bTime - aTime;
			})
			.slice(0, RECENT_TRADES_LIMIT)
			.map((trade) => toRecentTradeDto(trade, symbolMap, strategyMap));

		const accountsWithLiveBalance = accounts.map((account) => {
			const option = toAccountOption(account);
			const accountClosed = allTrades.filter(
				(trade) =>
					trade.accountId === account.id && trade.status === 'closed' && trade.profitLoss !== null,
			);
			return {
				...option,
				currentBalance: computeCurrentBalance(
					account.startingBalance,
					accountClosed.map((trade) => trade.profitLoss),
				),
			};
		});

		return {
			hasAccounts: true,
			accounts: accountsWithLiveBalance,
			activeAccountId: activeAccount.id,
			currency: activeAccount.currency,
			startingBalance,
			currentBalance,
			performance,
			streaks,
			drawdown: {
				...drawdown,
				points: drawdown.points.map((point) => ({ ...point, closedAt: point.closedAt.toISOString() })),
			} satisfies DashboardDrawdownSummary,
			equityCurve: equityCurve.map(serializeEquityPoint),
			recentTrades,
		};
	}
}

export const dashboardService = new DashboardService();
