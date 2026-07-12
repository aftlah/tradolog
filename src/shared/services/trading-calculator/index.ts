export { TradingCalculatorService, tradingCalculatorService } from './trading-calculator.service';

export {
	calculateActualRiskReward,
	calculateHoldingTimeSeconds,
	calculatePips,
	calculatePlannedRiskReward,
	calculateProfitLoss,
	calculateProfitLossPercent,
	calculateProfitPerLot,
	calculateReward,
	calculateRewardAmount,
	calculateRisk,
	calculateRiskAmount,
	calculateTradeMetrics,
	formatHoldingTime,
} from './trade-metrics';

export {
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

export { calculateStreaks } from './streaks';

export { buildEquityCurve, calculateDrawdown } from './drawdown';

export {
	calculateDailyReturns,
	calculateMonthlyReturns,
	calculatePeriodReturns,
	calculateWeeklyReturns,
} from './period-returns';

export { average, max, min, round, safeDivide, sum, toFiniteNumber, toNullableDate, toNullableNumber } from './utils';

export * from './types';

export {
	PERCENT_DECIMALS,
	PIPS_DECIMALS,
	PRICE_DECIMALS,
	RR_DECIMALS,
	SECONDS_PER_DAY,
	SECONDS_PER_HOUR,
	SECONDS_PER_MINUTE,
} from './constants';
