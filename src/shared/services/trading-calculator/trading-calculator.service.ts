/**
 * TradingCalculatorService
 *
 * The single, reusable, framework-agnostic entry point for every trading calculation in
 * Tradolog. Every method is a thin, stateless delegate to a pure function defined elsewhere in
 * this module — the class itself holds no state and performs no I/O, so it is trivially safe
 * to import from any layer (services, API routes, scripts) without pulling in the database or
 * UI.
 *
 * Per the project rules: trading calculations must never live inside React components, and all
 * Dashboard/Analytics statistics must be sourced from this service.
 */
import {
	calculateActualRiskReward,
	calculateHoldingTimeSeconds,
	calculatePips,
	calculatePlannedRiskReward,
	calculateProfitLoss,
	calculateProfitLossPercent,
	calculateReward,
	calculateRewardAmount,
	calculateRisk,
	calculateRiskAmount,
	calculateTradeMetrics,
	formatHoldingTime,
} from './trade-metrics';
import {
	calculateAverageHoldingTimeSeconds,
	calculateAverageLoss,
	calculateAverageRiskReward,
	calculateAverageWin,
	calculateExpectancy,
	calculateLargestLoss,
	calculateLargestWin,
	calculatePerformanceSummary,
	calculateProfitFactor,
	calculateWinRate,
	classifyTradeOutcome,
} from './performance-metrics';
import { calculateStreaks } from './streaks';
import { buildEquityCurve, calculateDrawdown } from './drawdown';
import {
	calculateDailyReturns,
	calculateMonthlyReturns,
	calculatePeriodReturns,
	calculateWeeklyReturns,
} from './period-returns';
import type {
	ClosedTradeResult,
	DrawdownSummary,
	EquityPoint,
	NumericInput,
	PerformanceSummary,
	PeriodGranularity,
	PeriodReturn,
	StreakSummary,
	TradeDirection,
	TradeMetrics,
	TradeOutcome,
	TradePriceInput,
} from './types';

export class TradingCalculatorService {
	// ---- Per-trade formulas -------------------------------------------------------------

	risk(entryPrice: NumericInput, stopLoss: NumericInput): number | null {
		return calculateRisk(entryPrice, stopLoss);
	}

	reward(entryPrice: NumericInput, takeProfit: NumericInput): number | null {
		return calculateReward(entryPrice, takeProfit);
	}

	riskAmount(risk: number | null, quantity: NumericInput): number | null {
		return calculateRiskAmount(risk, quantity);
	}

	rewardAmount(reward: number | null, quantity: NumericInput): number | null {
		return calculateRewardAmount(reward, quantity);
	}

	plannedRiskReward(riskAmount: number | null, rewardAmount: number | null): number | null {
		return calculatePlannedRiskReward(riskAmount, rewardAmount);
	}

	profitLoss(
		side: TradeDirection,
		entryPrice: NumericInput,
		exitPrice: NumericInput,
		quantity: NumericInput,
		fees: NumericInput = 0,
	): number | null {
		return calculateProfitLoss(side, entryPrice, exitPrice, quantity, fees);
	}

	profitLossPercent(
		profitLoss: number | null,
		entryPrice: NumericInput,
		quantity: NumericInput,
		basis?: number,
	): number | null {
		return calculateProfitLossPercent(profitLoss, entryPrice, quantity, basis);
	}

	actualRiskReward(profitLoss: number | null, riskAmount: number | null): number | null {
		return calculateActualRiskReward(profitLoss, riskAmount);
	}

	pips(
		side: TradeDirection,
		entryPrice: NumericInput,
		exitPrice: NumericInput,
		pipSize: NumericInput,
	): number | null {
		return calculatePips(side, entryPrice, exitPrice, pipSize);
	}

	holdingTimeSeconds(openedAt: TradePriceInput['openedAt'], closedAt: TradePriceInput['closedAt']): number | null {
		return calculateHoldingTimeSeconds(openedAt, closedAt);
	}

	formatHoldingTime(seconds: number | null): string {
		return formatHoldingTime(seconds);
	}

	/** Computes every derivable per-trade metric in one call. Use this from the Trade CRUD service. */
	tradeMetrics(input: TradePriceInput): TradeMetrics {
		return calculateTradeMetrics(input);
	}

	// ---- Portfolio / aggregate formulas -------------------------------------------------

	classifyOutcome(profitLoss: number): TradeOutcome {
		return classifyTradeOutcome(profitLoss);
	}

	winRate(trades: readonly ClosedTradeResult[]): number {
		return calculateWinRate(trades);
	}

	profitFactor(trades: readonly ClosedTradeResult[]): number | null {
		return calculateProfitFactor(trades);
	}

	expectancy(trades: readonly ClosedTradeResult[]): number {
		return calculateExpectancy(trades);
	}

	averageWin(trades: readonly ClosedTradeResult[]): number {
		return calculateAverageWin(trades);
	}

	averageLoss(trades: readonly ClosedTradeResult[]): number {
		return calculateAverageLoss(trades);
	}

	largestWin(trades: readonly ClosedTradeResult[]): number {
		return calculateLargestWin(trades);
	}

	largestLoss(trades: readonly ClosedTradeResult[]): number {
		return calculateLargestLoss(trades);
	}

	averageRiskReward(rrValues: readonly (number | null | undefined)[]): number | null {
		return calculateAverageRiskReward(rrValues);
	}

	averageHoldingTimeSeconds(trades: readonly ClosedTradeResult[]): number | null {
		return calculateAverageHoldingTimeSeconds(trades);
	}

	/** The single call Dashboard/Analytics should use to source every headline statistic. */
	performanceSummary(trades: readonly ClosedTradeResult[]): PerformanceSummary {
		return calculatePerformanceSummary(trades);
	}

	// ---- Streaks --------------------------------------------------------------------------

	streaks(trades: readonly ClosedTradeResult[]): StreakSummary {
		return calculateStreaks(trades);
	}

	// ---- Equity curve / drawdown -----------------------------------------------------------

	equityCurve(startingBalance: number, trades: readonly ClosedTradeResult[]): EquityPoint[] {
		return buildEquityCurve(startingBalance, trades);
	}

	drawdown(startingBalance: number, trades: readonly ClosedTradeResult[]): DrawdownSummary {
		return calculateDrawdown(startingBalance, trades);
	}

	// ---- Period returns ---------------------------------------------------------------------

	periodReturns(
		trades: readonly ClosedTradeResult[],
		granularity: PeriodGranularity,
		startingBalance?: number,
	): PeriodReturn[] {
		return calculatePeriodReturns(trades, granularity, startingBalance);
	}

	dailyReturns(trades: readonly ClosedTradeResult[], startingBalance?: number): PeriodReturn[] {
		return calculateDailyReturns(trades, startingBalance);
	}

	weeklyReturns(trades: readonly ClosedTradeResult[], startingBalance?: number): PeriodReturn[] {
		return calculateWeeklyReturns(trades, startingBalance);
	}

	monthlyReturns(trades: readonly ClosedTradeResult[], startingBalance?: number): PeriodReturn[] {
		return calculateMonthlyReturns(trades, startingBalance);
	}
}

export const tradingCalculatorService = new TradingCalculatorService();
