import { parseOrThrow } from '@shared/lib/validation';
import { invalidateUserPageCaches } from '@shared/lib/cache/page-data-cache';
import { profileRepository, riskRulesRepository, type TradeClosedMetrics } from '@shared/repositories';
import { tradeService, toFiniteNumber, toNullableNumber, type ClosedTradeResult } from '@shared/services';
import { riskRulesInsertSchema, riskRulesUpdateSchema } from '@shared/validators';
import { APP_TIMEZONE } from '@shared/utils/datetime';
import type { RiskRules } from '@shared/types';
import { riskRulesFormSchema } from '../validators/risk-schemas';
import type { RiskAlertDto, RiskRulesDto } from '../types/risk.types';
import { evaluateRiskRules, type RiskRuleLimits } from '../utils/evaluate-risk-rules';

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

function toLimits(row: RiskRules): RiskRuleLimits {
	return {
		enabled: row.enabled,
		maxDailyLossAmount: toNullableNumber(row.maxDailyLossAmount),
		maxDailyLossPercent: toNullableNumber(row.maxDailyLossPercent),
		maxWeeklyLossAmount: toNullableNumber(row.maxWeeklyLossAmount),
		maxWeeklyLossPercent: toNullableNumber(row.maxWeeklyLossPercent),
		maxTradesPerDay: row.maxTradesPerDay,
		maxConsecutiveLosses: row.maxConsecutiveLosses,
	};
}

function toDto(row: RiskRules): RiskRulesDto {
	const limits = toLimits(row);
	return {
		enabled: limits.enabled,
		maxDailyLossAmount: limits.maxDailyLossAmount,
		maxDailyLossPercent: limits.maxDailyLossPercent,
		maxWeeklyLossAmount: limits.maxWeeklyLossAmount,
		maxWeeklyLossPercent: limits.maxWeeklyLossPercent,
		maxTradesPerDay: limits.maxTradesPerDay,
		maxConsecutiveLosses: limits.maxConsecutiveLosses,
	};
}

function emptyDto(): RiskRulesDto {
	return {
		enabled: true,
		maxDailyLossAmount: null,
		maxDailyLossPercent: null,
		maxWeeklyLossAmount: null,
		maxWeeklyLossPercent: null,
		maxTradesPerDay: null,
		maxConsecutiveLosses: null,
	};
}

function optionalAmountToString(value: number | null | undefined): string | null {
	if (value === null || value === undefined) {
		return null;
	}
	return String(value);
}

/**
 * RiskRulesService — config CRUD + alert evaluation against closed trades.
 * UI → RiskRulesService → RiskRulesRepository / TradeService / ProfileRepository → DB
 */
export class RiskRulesService {
	async getOrCreate(userId: string): Promise<RiskRules> {
		const existing = await riskRulesRepository.findByUserId(userId);
		if (existing) {
			return existing;
		}
		const data = parseOrThrow(riskRulesInsertSchema, { userId, enabled: true });
		return riskRulesRepository.insert(data);
	}

	async getDto(userId: string): Promise<RiskRulesDto> {
		const row = await riskRulesRepository.findByUserId(userId);
		return row ? toDto(row) : emptyDto();
	}

	async updateFromForm(userId: string, input: unknown): Promise<RiskRulesDto> {
		const form = parseOrThrow(riskRulesFormSchema, input);
		await this.getOrCreate(userId);

		const payload = parseOrThrow(riskRulesUpdateSchema, {
			enabled: form.enabled,
			maxDailyLossAmount: optionalAmountToString(form.maxDailyLossAmount),
			maxDailyLossPercent: optionalAmountToString(form.maxDailyLossPercent),
			maxWeeklyLossAmount: optionalAmountToString(form.maxWeeklyLossAmount),
			maxWeeklyLossPercent: optionalAmountToString(form.maxWeeklyLossPercent),
			maxTradesPerDay: form.maxTradesPerDay,
			maxConsecutiveLosses: form.maxConsecutiveLosses,
		});

		const updated = await riskRulesRepository.updateByUserId(userId, payload);
		if (!updated) {
			throw new Error('Could not update risk rules.');
		}
		await invalidateUserPageCaches(userId);
		return toDto(updated);
	}

	async evaluateForAccount(
		userId: string,
		accountId: string,
		startingBalance: number,
		closedMetrics?: TradeClosedMetrics[],
	): Promise<RiskAlertDto[]> {
		const [rules, metrics, profile] = await Promise.all([
			riskRulesRepository.findByUserId(userId),
			closedMetrics
				? Promise.resolve(closedMetrics)
				: tradeService.listClosedMetricsByAccount(userId, accountId),
			profileRepository.findByUserId(userId),
		]);

		if (!rules || !rules.enabled) {
			return [];
		}

		const closedTrades = metrics
			.map(toClosedTradeResult)
			.filter((result): result is ClosedTradeResult => result !== null);

		const alerts = evaluateRiskRules({
			limits: toLimits(rules),
			closedTrades,
			startingBalance: toFiniteNumber(startingBalance),
			timeZone: profile?.timezone?.trim() || APP_TIMEZONE,
		});

		return alerts;
	}
}

export const riskRulesService = new RiskRulesService();
