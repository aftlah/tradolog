import type { GoalDto } from '../types/goals.types';
import type { GoalFormInput } from '../validators/goal-schemas';

/** Builds the RHF default values for the Create/Edit Goal form from an existing goal, or a blank "this month" goal when creating. */
export function buildGoalFormDefaults(goal: GoalDto | null): GoalFormInput {
	if (!goal) {
		const now = new Date();
		return {
			year: now.getUTCFullYear(),
			month: now.getUTCMonth() + 1,
			title: '',
			description: '',
			targetProfit: '',
			targetWinRate: '',
			targetTradeCount: '',
			maxDrawdownPercent: '',
			status: 'active',
		};
	}

	return {
		year: goal.year,
		month: goal.month,
		title: goal.title,
		description: goal.description ?? '',
		targetProfit: goal.targetProfit ?? '',
		targetWinRate: goal.targetWinRate ?? '',
		targetTradeCount: goal.targetTradeCount ?? '',
		maxDrawdownPercent: goal.maxDrawdownPercent ?? '',
		status: goal.status,
	};
}
