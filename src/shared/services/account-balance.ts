import { PRICE_DECIMALS, round, toFiniteNumber, type NumericInput } from '@shared/services/trading-calculator';

/** Current balance = starting balance + sum of closed-trade P&L (already in account currency). */
export function computeCurrentBalance(
	startingBalance: NumericInput,
	closedProfitLosses: readonly NumericInput[],
): number {
	const start = toFiniteNumber(startingBalance);
	let totalPnl = 0;
	for (const profitLoss of closedProfitLosses) {
		totalPnl += toFiniteNumber(profitLoss);
	}
	return round(start + totalPnl, PRICE_DECIMALS);
}
