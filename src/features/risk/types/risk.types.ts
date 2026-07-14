import type { RiskAlert, RiskAlertRuleId, RiskAlertSeverity } from '../utils/evaluate-risk-rules';

export type { RiskAlertRuleId, RiskAlertSeverity };

export interface RiskRulesDto {
	enabled: boolean;
	maxDailyLossAmount: number | null;
	maxDailyLossPercent: number | null;
	maxWeeklyLossAmount: number | null;
	maxWeeklyLossPercent: number | null;
	maxTradesPerDay: number | null;
	maxConsecutiveLosses: number | null;
}

export type RiskAlertDto = RiskAlert;
