import type { GoalStatus } from '@shared/types';

/**
 * Fully derived monthly goal payload: raw targets alongside the actuals computed by
 * `TradingCalculatorService` from that month's closed trades, plus ready-to-render progress
 * percentages and target-met flags. The UI never calculates any of this itself.
 */
export interface GoalDto {
	id: string;
	year: number;
	month: number;
	title: string;
	description: string | null;
	status: GoalStatus;

	targetProfit: number | null;
	targetWinRate: number | null;
	targetTradeCount: number | null;
	maxDrawdownPercent: number | null;

	actualProfit: number;
	actualWinRate: number;
	actualTradeCount: number;
	actualMaxDrawdownPercent: number;

	/** Percentage of target reached, `null` when the goal has no target for that metric. */
	profitProgressPercent: number | null;
	winRateProgressPercent: number | null;
	tradeCountProgressPercent: number | null;

	isProfitTargetMet: boolean;
	isWinRateTargetMet: boolean;
	isTradeCountTargetMet: boolean;
	isWithinDrawdownLimit: boolean;

	createdAt: string;
	updatedAt: string;
}
