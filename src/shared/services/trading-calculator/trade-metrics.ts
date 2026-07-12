/**
 * Pure, per-trade formulas.
 *
 * Every function here takes primitive/normalized inputs and returns a primitive result — no
 * database access, no side effects, no UI concerns. `null` is used consistently to mean
 * "cannot be computed from the given inputs" (e.g. no stop-loss set, trade not yet closed),
 * which is distinct from a computed value of `0`.
 */
import { PERCENT_DECIMALS, PIPS_DECIMALS, PRICE_DECIMALS, RR_DECIMALS } from './constants';
import type { DateInput, NumericInput, TradeDirection, TradeMetrics, TradePriceInput } from './types';
import { round, toFiniteNumber, toNullableDate, toNullableNumber } from './utils';

/**
 * Risk = |Entry Price − Stop Loss|
 *
 * The per-unit price distance between the entry and the invalidation (stop-loss) level.
 * Returns `null` when no stop-loss is set — an unset stop means risk is *unknown*, not zero.
 */
export function calculateRisk(entryPrice: NumericInput, stopLoss: NumericInput): number | null {
	const stop = toNullableNumber(stopLoss);
	if (stop === null) {
		return null;
	}
	return round(Math.abs(toFiniteNumber(entryPrice) - stop), PRICE_DECIMALS);
}

/**
 * Reward = |Take Profit − Entry Price|
 *
 * The per-unit price distance between the entry and the target (take-profit) level.
 * Returns `null` when no take-profit is set.
 */
export function calculateReward(entryPrice: NumericInput, takeProfit: NumericInput): number | null {
	const target = toNullableNumber(takeProfit);
	if (target === null) {
		return null;
	}
	return round(Math.abs(target - toFiniteNumber(entryPrice)), PRICE_DECIMALS);
}

function resolveContractSize(contractSize: NumericInput = 1): number {
	const size = toFiniteNumber(contractSize, 1);
	return size > 0 ? size : 1;
}

function resolveFxRate(fxRate: NumericInput = 1): number {
	const rate = toFiniteNumber(fxRate, 1);
	return rate > 0 ? rate : 1;
}

function applyFxRate(amount: number | null, fxRate: number): number | null {
	if (amount === null) {
		return null;
	}
	if (fxRate === 1) {
		return amount;
	}
	return round(amount * fxRate, PRICE_DECIMALS);
}

/**
 * Risk Amount = Risk × Quantity × Contract Size
 *
 * The capital (in quote currency) exposed if the stop-loss is hit.
 */
export function calculateRiskAmount(
	risk: number | null,
	quantity: NumericInput,
	contractSize: NumericInput = 1,
): number | null {
	if (risk === null) {
		return null;
	}
	return round(risk * toFiniteNumber(quantity) * resolveContractSize(contractSize), PRICE_DECIMALS);
}

/**
 * Reward Amount = Reward × Quantity × Contract Size
 *
 * The capital (in quote currency) that would be gained if the take-profit is hit.
 */
export function calculateRewardAmount(
	reward: number | null,
	quantity: NumericInput,
	contractSize: NumericInput = 1,
): number | null {
	if (reward === null) {
		return null;
	}
	return round(reward * toFiniteNumber(quantity) * resolveContractSize(contractSize), PRICE_DECIMALS);
}

/**
 * Planned RR = Reward Amount ÷ Risk Amount
 *
 * The risk/reward ratio the trade was planned with, before it played out. `null` when either
 * amount is unknown, or when risk amount is 0 (division would be meaningless/infinite).
 */
export function calculatePlannedRiskReward(
	riskAmount: number | null,
	rewardAmount: number | null,
): number | null {
	if (riskAmount === null || rewardAmount === null || riskAmount <= 0) {
		return null;
	}
	return round(rewardAmount / riskAmount, RR_DECIMALS);
}

/**
 * Profit / Loss
 *
 * Long:  (Exit Price − Entry Price) × Quantity × Contract Size − Fees
 * Short: (Entry Price − Exit Price) × Quantity × Contract Size − Fees
 *
 * For XAUUSD, contract size is typically `100` (oz per standard lot). `null` when the trade
 * has no exit price yet (still open/planned).
 */
export function calculateProfitLoss(
	side: TradeDirection,
	entryPrice: NumericInput,
	exitPrice: NumericInput,
	quantity: NumericInput,
	fees: NumericInput = 0,
	contractSize: NumericInput = 1,
): number | null {
	const exit = toNullableNumber(exitPrice);
	if (exit === null) {
		return null;
	}
	const entry = toFiniteNumber(entryPrice);
	const qty = toFiniteNumber(quantity);
	const feeAmount = toFiniteNumber(fees, 0);
	const directionalMove = side === 'long' ? exit - entry : entry - exit;
	return round(directionalMove * qty * resolveContractSize(contractSize) - feeAmount, PRICE_DECIMALS);
}

/**
 * Profit % = Profit ÷ Position Notional × 100, where Position Notional =
 * Entry Price × Quantity × Contract Size by default (or a custom `basis` when supplied).
 */
export function calculateProfitLossPercent(
	profitLoss: number | null,
	entryPrice: NumericInput,
	quantity: NumericInput,
	basis?: number,
	contractSize: NumericInput = 1,
): number | null {
	if (profitLoss === null) {
		return null;
	}
	const denominator =
		basis ?? toFiniteNumber(entryPrice) * toFiniteNumber(quantity) * resolveContractSize(contractSize);
	if (!Number.isFinite(denominator) || denominator <= 0) {
		return null;
	}
	return round((profitLoss / denominator) * 100, PERCENT_DECIMALS);
}

/** Profit Per Lot = Profit / Loss ÷ Quantity (lot size). */
export function calculateProfitPerLot(profitLoss: number | null, quantity: NumericInput): number | null {
	if (profitLoss === null) {
		return null;
	}
	const qty = toFiniteNumber(quantity);
	if (!Number.isFinite(qty) || qty <= 0) {
		return null;
	}
	return round(profitLoss / qty, PRICE_DECIMALS);
}

/**
 * Actual RR = Profit / Loss ÷ Risk Amount
 *
 * The risk/reward ratio the trade actually achieved. Positive when the trade won, negative
 * when it lost, `0` on breakeven. `null` when risk amount is unknown or 0.
 */
export function calculateActualRiskReward(
	profitLoss: number | null,
	riskAmount: number | null,
): number | null {
	if (profitLoss === null || riskAmount === null || riskAmount <= 0) {
		return null;
	}
	return round(profitLoss / riskAmount, RR_DECIMALS);
}

/**
 * Pips = Directional Price Move ÷ Pip Size
 *
 * Long:  (Exit Price − Entry Price) ÷ Pip Size
 * Short: (Entry Price − Exit Price) ÷ Pip Size
 *
 * Positive pips means favorable movement regardless of side. `null` when the trade isn't
 * closed yet or no pip size was supplied (pip size is instrument-specific and lives on the
 * `symbols` table, so it must be passed in — this module never touches the database).
 */
export function calculatePips(
	side: TradeDirection,
	entryPrice: NumericInput,
	exitPrice: NumericInput,
	pipSize: NumericInput,
): number | null {
	const exit = toNullableNumber(exitPrice);
	const pip = toNullableNumber(pipSize);
	if (exit === null || pip === null || pip === 0) {
		return null;
	}
	const entry = toFiniteNumber(entryPrice);
	const directionalMove = side === 'long' ? exit - entry : entry - exit;
	return round(directionalMove / pip, PIPS_DECIMALS);
}

/**
 * Holding Time = Closed At − Opened At, expressed in whole seconds.
 *
 * `null` when either timestamp is missing, or when `closedAt` precedes `openedAt` (invalid
 * ordering — surfacing `null` is safer than a negative duration).
 */
export function calculateHoldingTimeSeconds(
	openedAt: DateInput,
	closedAt: DateInput,
): number | null {
	const opened = toNullableDate(openedAt);
	const closed = toNullableDate(closedAt);
	if (!opened || !closed) {
		return null;
	}
	const diffMs = closed.getTime() - opened.getTime();
	if (diffMs < 0) {
		return null;
	}
	return Math.round(diffMs / 1000);
}

/**
 * Formats a holding-time duration (in seconds) into a short human-readable string, e.g.
 * `"2h 15m"`, `"3d 4h"`, `"45s"`. Returns `"—"` for `null`/negative input.
 */
export function formatHoldingTime(seconds: number | null): string {
	if (seconds === null || seconds < 0) {
		return '—';
	}
	if (seconds < 60) {
		return `${Math.round(seconds)}s`;
	}

	const days = Math.floor(seconds / 86_400);
	const hours = Math.floor((seconds % 86_400) / 3_600);
	const minutes = Math.floor((seconds % 3_600) / 60);

	if (days > 0) {
		return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
	}
	if (hours > 0) {
		return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
	}
	return `${minutes}m`;
}

/**
 * Computes every derivable per-trade metric from a single set of raw inputs. This is the
 * primary entry point the Trade CRUD service (Feature 4/5) should call whenever a trade is
 * created or updated, so all derived columns stay in sync automatically.
 */
export function calculateTradeMetrics(input: TradePriceInput): TradeMetrics {
	const contractSize = input.contractSize ?? 1;
	const fxRate = resolveFxRate(input.fxRate);
	const risk = calculateRisk(input.entryPrice, input.stopLoss);
	const reward = calculateReward(input.entryPrice, input.takeProfit);
	const riskAmountQuote = calculateRiskAmount(risk, input.quantity, contractSize);
	const rewardAmountQuote = calculateRewardAmount(reward, input.quantity, contractSize);
	const plannedRR = calculatePlannedRiskReward(riskAmountQuote, rewardAmountQuote);
	const profitLossQuote = calculateProfitLoss(
		input.side,
		input.entryPrice,
		input.exitPrice,
		input.quantity,
		input.fees,
		contractSize,
	);
	const profitLossPercent = calculateProfitLossPercent(
		profitLossQuote,
		input.entryPrice,
		input.quantity,
		undefined,
		contractSize,
	);
	const profitLoss = applyFxRate(profitLossQuote, fxRate);
	const riskAmount = applyFxRate(riskAmountQuote, fxRate);
	const rewardAmount = applyFxRate(rewardAmountQuote, fxRate);
	const profitPerLot = calculateProfitPerLot(profitLoss, input.quantity);
	const actualRR = calculateActualRiskReward(profitLossQuote, riskAmountQuote);
	const pips = calculatePips(input.side, input.entryPrice, input.exitPrice, input.pipSize);
	const holdingTimeSeconds = calculateHoldingTimeSeconds(input.openedAt, input.closedAt);

	return {
		risk,
		reward,
		riskAmount,
		rewardAmount,
		plannedRR,
		profitLoss,
		profitLossPercent,
		profitPerLot,
		actualRR,
		pips,
		holdingTimeSeconds,
	};
}
