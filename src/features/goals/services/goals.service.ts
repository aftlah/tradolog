/**
 * GoalsService
 *
 * Composes `monthlyGoalRepository` with `tradeService` and `TradingCalculatorService` to turn a
 * raw monthly goal row into a fully derived `GoalDto`: every actual (profit, win rate, trade
 * count, drawdown) is computed here from that month's closed trades, and the UI only ever
 * renders numbers this service has already produced.
 *
 * UI → GoalsService → (MonthlyGoalRepository / TradeService) + TradingCalculatorService → Database
 */
import { NotFoundError } from '@shared/lib/errors';
import { parseOrThrow } from '@shared/lib/validation';
import { monthlyGoalRepository, type TradeClosedMetrics } from '@shared/repositories';
import { tradeService, tradingCalculatorService, round, toNullableNumber, type ClosedTradeResult } from '@shared/services';
import { monthlyGoalInsertSchema, monthlyGoalUpdateSchema } from '@shared/validators';
import type { MonthlyGoal } from '@shared/types';
import { goalFormSchema } from '../validators/goal-schemas';
import type { GoalDto } from '../types/goals.types';

function toClosedTradeResult(row: TradeClosedMetrics): ClosedTradeResult | null {
	if (row.profitLoss === null || row.closedAt === null) {
		return null;
	}
	return {
		profitLoss: row.profitLoss,
		closedAt: row.closedAt,
		plannedRR: row.plannedRr,
		actualRR: row.actualRr,
		holdingTimeSeconds: row.holdingTimeSeconds,
	};
}

function isClosedWithinPeriod(row: TradeClosedMetrics, year: number, month: number): boolean {
	if (row.profitLoss === null || row.closedAt === null) {
		return false;
	}
	return row.closedAt.getUTCFullYear() === year && row.closedAt.getUTCMonth() + 1 === month;
}

/** Percentage of `target` reached by `actual`, or `null` when the goal has no target for this metric. */
function progressPercent(actual: number, target: number | null): number | null {
	if (target === null || target === 0) {
		return null;
	}
	return round((actual / target) * 100, 1);
}

function toGoalDto(goal: MonthlyGoal, closedMetrics: readonly TradeClosedMetrics[]): GoalDto {
	const closedResults = closedMetrics
		.filter((row) => isClosedWithinPeriod(row, goal.year, goal.month))
		.map(toClosedTradeResult)
		.filter((result): result is ClosedTradeResult => result !== null);

	const performance = tradingCalculatorService.performanceSummary(closedResults);
	const drawdown = tradingCalculatorService.drawdown(0, closedResults);

	const targetProfit = toNullableNumber(goal.targetProfit);
	const targetWinRate = toNullableNumber(goal.targetWinRate);
	const targetTradeCount = goal.targetTradeCount;
	const maxDrawdownPercent = toNullableNumber(goal.maxDrawdownPercent);

	const actualProfit = round(performance.grossProfit - performance.grossLoss, 2);
	const actualWinRate = performance.winRate;
	const actualTradeCount = performance.totalTrades;
	const actualMaxDrawdownPercent = drawdown.maxDrawdownPercent;

	return {
		id: goal.id,
		year: goal.year,
		month: goal.month,
		title: goal.title,
		description: goal.description,
		status: goal.status,

		targetProfit,
		targetWinRate,
		targetTradeCount,
		maxDrawdownPercent,

		actualProfit,
		actualWinRate,
		actualTradeCount,
		actualMaxDrawdownPercent,

		profitProgressPercent: progressPercent(actualProfit, targetProfit),
		winRateProgressPercent: progressPercent(actualWinRate, targetWinRate),
		tradeCountProgressPercent: progressPercent(actualTradeCount, targetTradeCount),

		isProfitTargetMet: targetProfit !== null && actualProfit >= targetProfit,
		isWinRateTargetMet: targetWinRate !== null && actualWinRate >= targetWinRate,
		isTradeCountTargetMet: targetTradeCount !== null && actualTradeCount >= targetTradeCount,
		isWithinDrawdownLimit: maxDrawdownPercent === null || actualMaxDrawdownPercent <= maxDrawdownPercent,

		createdAt: goal.createdAt.toISOString(),
		updatedAt: goal.updatedAt.toISOString(),
	};
}

async function loadClosedMetrics(userId: string, accountId?: string): Promise<TradeClosedMetrics[]> {
	if (accountId) {
		return tradeService.listClosedMetricsByAccount(userId, accountId);
	}

	const trades = await tradeService.list(userId);
	return trades
		.filter((trade) => trade.status === 'closed')
		.map((trade) => ({
			id: trade.id,
			profitLoss: trade.profitLoss,
			closedAt: trade.closedAt,
			plannedRr: trade.plannedRr,
			actualRr: trade.actualRr,
			holdingTimeSeconds: trade.holdingTimeSeconds,
		}));
}

export class GoalsService {
	/** Every one of `userId`'s goals, each with its actuals computed from that month's closed trades, optionally scoped to a single account. */
	async listWithProgress(userId: string, accountId?: string): Promise<GoalDto[]> {
		const [goals, closedMetrics] = await Promise.all([
			monthlyGoalRepository.listByUserId(userId),
			loadClosedMetrics(userId, accountId),
		]);

		return goals.map((goal) => toGoalDto(goal, closedMetrics));
	}

	async create(userId: string, input: unknown): Promise<GoalDto> {
		const form = parseOrThrow(goalFormSchema, input);
		const data = parseOrThrow(monthlyGoalInsertSchema, {
			userId,
			year: form.year,
			month: form.month,
			title: form.title,
			description: form.description ?? null,
			targetProfit: form.targetProfit !== null && form.targetProfit !== undefined ? String(form.targetProfit) : null,
			targetWinRate: form.targetWinRate !== null && form.targetWinRate !== undefined ? String(form.targetWinRate) : null,
			targetTradeCount: form.targetTradeCount ?? null,
			maxDrawdownPercent:
				form.maxDrawdownPercent !== null && form.maxDrawdownPercent !== undefined ? String(form.maxDrawdownPercent) : null,
			status: form.status,
		});

		const goal = await monthlyGoalRepository.insert(data);
		const closedMetrics = await loadClosedMetrics(userId);
		return toGoalDto(goal, closedMetrics);
	}

	async update(id: string, userId: string, input: unknown): Promise<GoalDto> {
		const form = parseOrThrow(goalFormSchema, input);
		const data = parseOrThrow(monthlyGoalUpdateSchema, {
			year: form.year,
			month: form.month,
			title: form.title,
			description: form.description ?? null,
			targetProfit: form.targetProfit !== null && form.targetProfit !== undefined ? String(form.targetProfit) : null,
			targetWinRate: form.targetWinRate !== null && form.targetWinRate !== undefined ? String(form.targetWinRate) : null,
			targetTradeCount: form.targetTradeCount ?? null,
			maxDrawdownPercent:
				form.maxDrawdownPercent !== null && form.maxDrawdownPercent !== undefined ? String(form.maxDrawdownPercent) : null,
			status: form.status,
		});

		const updated = await monthlyGoalRepository.updateForUser(id, userId, data);
		if (!updated) {
			throw new NotFoundError('Goal not found.');
		}

		const closedMetrics = await loadClosedMetrics(userId);
		return toGoalDto(updated, closedMetrics);
	}

	async remove(id: string, userId: string): Promise<void> {
		const deleted = await monthlyGoalRepository.softDeleteForUser(id, userId);
		if (!deleted) {
			throw new NotFoundError('Goal not found.');
		}
	}
}

export const goalsService = new GoalsService();
