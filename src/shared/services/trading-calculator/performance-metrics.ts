/**
 * Portfolio-level (aggregate) formulas that summarize a collection of closed trades.
 *
 * All functions take an array of {@link ClosedTradeResult} — the minimal shape needed — so
 * they work equally well against real repository query results or hand-built fixtures in
 * tests.
 */
import { PERCENT_DECIMALS, PRICE_DECIMALS, RR_DECIMALS } from './constants';
import type { ClosedTradeResult, PerformanceSummary, TradeOutcome } from './types';
import { average, max, min, round, sum, toFiniteNumber, toNullableNumber } from './utils';

/** Classifies a realized P&L amount into a win/loss/breakeven outcome. */
export function classifyTradeOutcome(profitLoss: number): TradeOutcome {
	if (profitLoss > 0) {
		return 'win';
	}
	if (profitLoss < 0) {
		return 'loss';
	}
	return 'breakeven';
}

function toProfitLossValues(trades: readonly ClosedTradeResult[]): number[] {
	return trades.map((trade) => toFiniteNumber(trade.profitLoss));
}

/**
 * Win Rate = Wins ÷ Total Closed Trades × 100
 *
 * Total closed trades includes breakeven trades in the denominator (a breakeven trade is
 * neither a win nor a loss, but it is still a decided outcome). Returns `0` when there are no
 * trades.
 */
export function calculateWinRate(trades: readonly ClosedTradeResult[]): number {
	if (trades.length === 0) {
		return 0;
	}
	const wins = toProfitLossValues(trades).filter((pnl) => classifyTradeOutcome(pnl) === 'win').length;
	return round((wins / trades.length) * 100, PERCENT_DECIMALS);
}

/**
 * Profit Factor = Gross Profit ÷ |Gross Loss|
 *
 * Gross Profit is the sum of all winning trades; Gross Loss is the absolute sum of all losing
 * trades. Returns `null` when there is no data at all (no wins and no losses), and
 * `Number.POSITIVE_INFINITY` when there are wins but zero losses (an undefined-but-favorable
 * edge case callers should render as "∞").
 */
export function calculateProfitFactor(trades: readonly ClosedTradeResult[]): number | null {
	const values = toProfitLossValues(trades);
	const grossProfit = sum(values.filter((pnl) => pnl > 0));
	const grossLoss = Math.abs(sum(values.filter((pnl) => pnl < 0)));

	if (grossLoss === 0) {
		return grossProfit > 0 ? Number.POSITIVE_INFINITY : null;
	}
	return round(grossProfit / grossLoss, RR_DECIMALS);
}

/**
 * Expectancy = (Win Rate × Average Win) − (Loss Rate × |Average Loss|)
 *
 * The expected profit/loss per trade, in currency units, given the trader's historical win
 * rate and average win/loss sizes. Returns `0` when there are no trades.
 */
export function calculateExpectancy(trades: readonly ClosedTradeResult[]): number {
	if (trades.length === 0) {
		return 0;
	}
	const values = toProfitLossValues(trades);
	const wins = values.filter((pnl) => pnl > 0);
	const losses = values.filter((pnl) => pnl < 0);

	const winRateFraction = wins.length / trades.length;
	const lossRateFraction = losses.length / trades.length;
	const averageWin = average(wins);
	const averageLossAbs = Math.abs(average(losses));

	return round(winRateFraction * averageWin - lossRateFraction * averageLossAbs, PRICE_DECIMALS);
}

/** Average Win = mean P&L of all winning trades. `0` when there are none. */
export function calculateAverageWin(trades: readonly ClosedTradeResult[]): number {
	const wins = toProfitLossValues(trades).filter((pnl) => pnl > 0);
	return round(average(wins), PRICE_DECIMALS);
}

/** Average Loss = mean P&L of all losing trades, returned as a natural (negative) number. `0` when there are none. */
export function calculateAverageLoss(trades: readonly ClosedTradeResult[]): number {
	const losses = toProfitLossValues(trades).filter((pnl) => pnl < 0);
	return round(average(losses), PRICE_DECIMALS);
}

/** Largest Win = the single biggest winning trade's P&L. `0` when there are none. */
export function calculateLargestWin(trades: readonly ClosedTradeResult[]): number {
	const wins = toProfitLossValues(trades).filter((pnl) => pnl > 0);
	return round(max(wins), PRICE_DECIMALS);
}

/** Largest Loss = the single biggest losing trade's P&L, returned as a natural (negative) number. `0` when there are none. */
export function calculateLargestLoss(trades: readonly ClosedTradeResult[]): number {
	const losses = toProfitLossValues(trades).filter((pnl) => pnl < 0);
	return round(min(losses), PRICE_DECIMALS);
}

/**
 * Average RR = mean of a set of risk/reward ratios (planned or actual).
 *
 * Generic over both `plannedRR` and `actualRR` to avoid duplicating the same averaging logic —
 * pass whichever array of ratios you want summarized. `null` when no trade has a defined ratio.
 */
export function calculateAverageRiskReward(rrValues: readonly (number | null | undefined)[]): number | null {
	const values = rrValues.filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
	if (values.length === 0) {
		return null;
	}
	return round(average(values), RR_DECIMALS);
}

/** Average Holding Time, in seconds, across trades that have a known holding time. `null` when none do. */
export function calculateAverageHoldingTimeSeconds(trades: readonly ClosedTradeResult[]): number | null {
	const values = trades
		.map((trade) => toNullableNumber(trade.holdingTimeSeconds))
		.filter((value): value is number => value !== null);
	if (values.length === 0) {
		return null;
	}
	return Math.round(average(values));
}

/**
 * Builds the full {@link PerformanceSummary} for a set of closed trades — the single call the
 * Dashboard/Analytics feature should use to source every headline statistic, per the
 * "all Dashboard statistics must come from TradingCalculatorService" project rule.
 */
export function calculatePerformanceSummary(trades: readonly ClosedTradeResult[]): PerformanceSummary {
	const values = toProfitLossValues(trades);
	const wins = values.filter((pnl) => pnl > 0);
	const losses = values.filter((pnl) => pnl < 0);
	const breakevens = values.filter((pnl) => pnl === 0);

	return {
		totalTrades: trades.length,
		wins: wins.length,
		losses: losses.length,
		breakevens: breakevens.length,
		winRate: calculateWinRate(trades),
		profitFactor: calculateProfitFactor(trades),
		expectancy: calculateExpectancy(trades),
		averageWin: calculateAverageWin(trades),
		averageLoss: calculateAverageLoss(trades),
		largestWin: calculateLargestWin(trades),
		largestLoss: calculateLargestLoss(trades),
		averagePlannedRR: calculateAverageRiskReward(trades.map((trade) => toNullableNumber(trade.plannedRR))),
		averageActualRR: calculateAverageRiskReward(trades.map((trade) => toNullableNumber(trade.actualRR))),
		averageHoldingTimeSeconds: calculateAverageHoldingTimeSeconds(trades),
		grossProfit: round(sum(wins), PRICE_DECIMALS),
		grossLoss: round(Math.abs(sum(losses)), PRICE_DECIMALS),
	};
}
