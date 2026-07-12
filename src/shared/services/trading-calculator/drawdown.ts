/**
 * Equity curve and drawdown formulas.
 *
 * Drawdown is measured against the running peak-to-date equity, which is the standard
 * definition used by trading journals and prop-firm risk rules. `startingBalance` is supplied
 * by the caller (from the trading account's balance) since this module has no DB access.
 */
import { PERCENT_DECIMALS, PRICE_DECIMALS } from './constants';
import type { ClosedTradeResult, DrawdownPoint, DrawdownSummary, EquityPoint } from './types';
import { round, toFiniteNumber, toNullableDate } from './utils';

/**
 * Builds a chronological equity curve by applying each closed trade's realized P&L to a
 * running balance starting at `startingBalance`. Trades with no `closedAt` are ignored (they
 * cannot be placed on the timeline).
 */
export function buildEquityCurve(
	startingBalance: number,
	trades: readonly ClosedTradeResult[],
): EquityPoint[] {
	const ordered = trades
		.map((trade) => ({ profitLoss: toFiniteNumber(trade.profitLoss), closedAt: toNullableDate(trade.closedAt) }))
		.filter((trade): trade is { profitLoss: number; closedAt: Date } => trade.closedAt !== null)
		.sort((a, b) => a.closedAt.getTime() - b.closedAt.getTime());

	let runningEquity = startingBalance;
	return ordered.map((trade) => {
		runningEquity += trade.profitLoss;
		return {
			closedAt: trade.closedAt,
			profitLoss: round(trade.profitLoss, PRICE_DECIMALS),
			equity: round(runningEquity, PRICE_DECIMALS),
		};
	});
}

/**
 * Drawdown (at a point in time) = Peak Equity To Date − Current Equity
 * Drawdown % = Drawdown ÷ Peak Equity To Date × 100
 *
 * Maximum Drawdown = the largest Drawdown observed anywhere along the equity curve.
 * Current Drawdown = the Drawdown at the most recent point on the curve.
 *
 * All drawdown values are non-negative (a new equity high has a drawdown of 0).
 */
export function calculateDrawdown(
	startingBalance: number,
	trades: readonly ClosedTradeResult[],
): DrawdownSummary {
	const equityPoints = buildEquityCurve(startingBalance, trades);

	if (equityPoints.length === 0) {
		return {
			points: [],
			currentDrawdown: 0,
			currentDrawdownPercent: 0,
			maxDrawdown: 0,
			maxDrawdownPercent: 0,
		};
	}

	let peakEquity = startingBalance;
	let maxDrawdown = 0;
	let maxDrawdownPercent = 0;

	const points: DrawdownPoint[] = equityPoints.map((point) => {
		peakEquity = Math.max(peakEquity, point.equity);
		const drawdown = round(Math.max(peakEquity - point.equity, 0), PRICE_DECIMALS);
		const drawdownPercent = peakEquity > 0 ? round((drawdown / peakEquity) * 100, PERCENT_DECIMALS) : 0;

		maxDrawdown = Math.max(maxDrawdown, drawdown);
		maxDrawdownPercent = Math.max(maxDrawdownPercent, drawdownPercent);

		return { ...point, peakEquity: round(peakEquity, PRICE_DECIMALS), drawdown, drawdownPercent };
	});

	const latest = points[points.length - 1];

	return {
		points,
		currentDrawdown: latest?.drawdown ?? 0,
		currentDrawdownPercent: latest?.drawdownPercent ?? 0,
		maxDrawdown,
		maxDrawdownPercent,
	};
}
