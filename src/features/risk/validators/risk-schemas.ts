import { z } from 'zod';

const emptyToUndefined = (value: unknown) =>
	value === '' || value === null || value === undefined ? undefined : value;

/** Accepts form strings or JSON numbers; empty/null clears the limit. */
const optionalPositiveNumber = z.preprocess((value) => {
	if (value === '' || value === null || value === undefined) {
		return null;
	}
	if (typeof value === 'number') {
		return value;
	}
	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (!trimmed) {
			return null;
		}
		const parsed = Number(trimmed);
		return Number.isFinite(parsed) ? parsed : value;
	}
	return value;
}, z.union([z.number().positive('Must be greater than 0.'), z.null()]));

const optionalPositiveInt = z.preprocess((value) => {
	if (value === '' || value === null || value === undefined) {
		return null;
	}
	if (typeof value === 'number') {
		return value;
	}
	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (!trimmed) {
			return null;
		}
		const parsed = Number.parseInt(trimmed, 10);
		return Number.isFinite(parsed) ? parsed : value;
	}
	return value;
}, z.union([z.number().int().positive('Must be a positive whole number.'), z.null()]));

export const riskRulesFormSchema = z.object({
	enabled: z.preprocess(emptyToUndefined, z.boolean().default(true)),
	maxDailyLossAmount: optionalPositiveNumber,
	maxDailyLossPercent: optionalPositiveNumber,
	maxWeeklyLossAmount: optionalPositiveNumber,
	maxWeeklyLossPercent: optionalPositiveNumber,
	maxTradesPerDay: optionalPositiveInt,
	maxConsecutiveLosses: optionalPositiveInt,
});

export type RiskRulesFormValues = z.infer<typeof riskRulesFormSchema>;
export type RiskRulesFormInput = z.input<typeof riskRulesFormSchema>;
