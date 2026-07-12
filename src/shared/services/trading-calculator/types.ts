import type { TradeSide } from '@shared/types';

/**
 * Postgres `numeric` columns round-trip through Drizzle as strings (to avoid float precision
 * loss). Every calculator input accepts `number | string | null | undefined` so repository/DB
 * values can be passed straight through without the caller normalizing them first.
 */
export type NumericInput = number | string | null | undefined;

/** Accepts `Date` objects or ISO date strings; formulas normalize internally via {@link toNullableDate}. */
export type DateInput = Date | string | null | undefined;

export type TradeDirection = TradeSide;

export type TradeOutcome = 'win' | 'loss' | 'breakeven';

/** Raw price/quantity/time inputs required to derive every per-trade metric. */
export interface TradePriceInput {
	side: TradeDirection;
	entryPrice: NumericInput;
	exitPrice?: NumericInput;
	stopLoss?: NumericInput;
	takeProfit?: NumericInput;
	quantity: NumericInput;
	/** Trading fees/commissions for the round trip, always a positive number. Defaults to 0. */
	fees?: NumericInput;
	/** Size of one pip in quote-currency price units (e.g. `0.0001` for most FX pairs). */
	pipSize?: NumericInput;
	/**
	 * Units per 1.0 lot (e.g. `100` for XAUUSD). Defaults to `1` so symbols without a
	 * contract size keep the simple price × quantity formula.
	 */
	contractSize?: NumericInput;
	/**
	 * Quote → account currency rate (e.g. USDIDR `18050`). Applied to money metrics only
	 * (P&L, risk/reward amounts). Defaults to `1` (no conversion). Pips / RR stay unchanged.
	 */
	fxRate?: NumericInput;
	openedAt?: DateInput;
	closedAt?: DateInput;
}

/**
 * Fully derived per-trade metrics. Any field that cannot be computed from the given
 * `TradePriceInput` (missing stop-loss, trade not yet closed, etc.) is `null` rather than `0`,
 * so callers can distinguish "unknown" from "zero".
 */
export interface TradeMetrics {
	risk: number | null;
	reward: number | null;
	riskAmount: number | null;
	rewardAmount: number | null;
	plannedRR: number | null;
	profitLoss: number | null;
	profitLossPercent: number | null;
	/** Net P&L divided by lot size (`quantity`). `null` when P&L or quantity is unavailable. */
	profitPerLot: number | null;
	actualRR: number | null;
	pips: number | null;
	holdingTimeSeconds: number | null;
}

/** Minimal shape the portfolio-level (aggregate) calculators need for one closed trade. */
export interface ClosedTradeResult {
	profitLoss: NumericInput;
	closedAt: DateInput;
	plannedRR?: NumericInput;
	actualRR?: NumericInput;
	holdingTimeSeconds?: NumericInput;
}

export interface PerformanceSummary {
	totalTrades: number;
	wins: number;
	losses: number;
	breakevens: number;
	/** Percentage, 0-100. */
	winRate: number;
	/** `null` when there is no data at all, `Infinity` when there are wins but zero losses. */
	profitFactor: number | null;
	expectancy: number;
	averageWin: number;
	/** Natural (negative) average loss amount. */
	averageLoss: number;
	largestWin: number;
	/** Natural (negative) largest loss amount. */
	largestLoss: number;
	averagePlannedRR: number | null;
	averageActualRR: number | null;
	averageHoldingTimeSeconds: number | null;
	grossProfit: number;
	grossLoss: number;
}

export interface StreakSummary {
	currentWinStreak: number;
	currentLossStreak: number;
	maxWinStreak: number;
	maxLossStreak: number;
}

export interface EquityPoint {
	closedAt: Date;
	equity: number;
	profitLoss: number;
}

export interface DrawdownPoint extends EquityPoint {
	peakEquity: number;
	/** Currency amount, always >= 0. */
	drawdown: number;
	/** Percentage of peak equity, always >= 0. */
	drawdownPercent: number;
}

export interface DrawdownSummary {
	points: DrawdownPoint[];
	currentDrawdown: number;
	currentDrawdownPercent: number;
	maxDrawdown: number;
	maxDrawdownPercent: number;
}

export type PeriodGranularity = 'day' | 'week' | 'month';

export interface PeriodReturn {
	/** Start of the bucket (UTC midnight for day/week/month). */
	periodStart: Date;
	/** Stable, sortable grouping key (e.g. `2026-07-12`, `2026-W28`, `2026-07`). */
	periodKey: string;
	profitLoss: number;
	tradeCount: number;
	/** `null` when no starting balance was supplied, so a percent return can't be derived. */
	returnPercent: number | null;
}
