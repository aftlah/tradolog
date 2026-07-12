import type { TradeSide } from '@shared/types';

function toFinite(value: unknown): number | null {
	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : null;
	}
	if (typeof value !== 'string' || value.trim() === '') {
		return null;
	}
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Infers Long/Short from price geometry:
 * - Long:  SL below entry, TP above entry
 * - Short: SL above entry, TP below entry
 * Returns `null` when prices are missing or contradictory.
 */
export function inferTradeSide(
	entryPrice: unknown,
	stopLoss: unknown,
	takeProfit: unknown,
): TradeSide | null {
	const entry = toFinite(entryPrice);
	if (entry === null || entry <= 0) {
		return null;
	}

	const sl = toFinite(stopLoss);
	const tp = toFinite(takeProfit);
	const hasSl = sl !== null && sl > 0 && sl !== entry;
	const hasTp = tp !== null && tp > 0 && tp !== entry;

	if (hasSl && hasTp) {
		if (sl < entry && tp > entry) {
			return 'long';
		}
		if (sl > entry && tp < entry) {
			return 'short';
		}
		return null;
	}

	if (hasSl) {
		return sl < entry ? 'long' : 'short';
	}

	if (hasTp) {
		return tp > entry ? 'long' : 'short';
	}

	return null;
}
