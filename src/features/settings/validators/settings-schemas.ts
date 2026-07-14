import { z } from 'zod';
import { accountTypeSchema, marketTypeSchema } from '@shared/validators';

/**
 * RHF-friendly form schemas for the Settings feature. Native inputs only ever produce strings,
 * so decimal fields (balances, risk %, pip size, …) stay validated *strings* here — matching the
 * `numeric` columns' string-regex shape in the shared domain validators — while integer fields
 * (leverage, price precision) coerce to real numbers. This lets `SettingsService` re-validate the
 * exact same payload against `@shared/validators` without any manual type juggling.
 */
const emptyToUndefined = (value: unknown) => (value === '' || value === null ? undefined : value);
const emptyToNull = (value: unknown) => (value === '' ? null : value);

const optionalText = (max: number) => z.preprocess(emptyToNull, z.string().max(max).nullable().optional());

const decimalString = (message = 'Enter a valid number.') =>
	z.string().trim().regex(/^-?\d+(\.\d+)?$/, message);

const requiredDecimalString = (message: string) => z.preprocess(emptyToUndefined, decimalString(message));

const optionalDecimalString = z.preprocess(emptyToUndefined, decimalString().optional().nullable());

const optionalPositiveInt = z.preprocess(
	emptyToUndefined,
	z.coerce.number().int().positive('Must be a positive whole number.').optional().nullable(),
);

const requiredNonNegativeInt = (max: number) =>
	z.preprocess(emptyToUndefined, z.coerce.number().int().min(0, 'Must be 0 or greater.').max(max));

const currencyCodeSchema = z.string().trim().length(3, 'Use a 3-letter currency code.');

export const profileFormSchema = z.object({
	displayName: optionalText(120),
	timezone: z.string().trim().min(1, 'Timezone is required.').max(64),
	baseCurrency: currencyCodeSchema,
	riskPerTradePercent: optionalDecimalString,
	defaultRiskReward: optionalDecimalString,
	bio: optionalText(2000),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type ProfileFormInput = z.input<typeof profileFormSchema>;

export const accountFormSchema = z
	.object({
		name: z.string().trim().min(1, 'Account name is required.').max(120),
		broker: optionalText(120),
		accountType: accountTypeSchema,
		currency: currencyCodeSchema,
		startingBalance: requiredDecimalString('Starting balance is required.'),
		leverage: optionalPositiveInt,
		quoteToAccountRate: optionalDecimalString,
		isDefault: z.boolean().default(false),
		notes: optionalText(5000),
	})
	.superRefine((data, ctx) => {
		const currency = data.currency.trim().toUpperCase();
		if (currency !== 'USD' && !data.quoteToAccountRate) {
			ctx.addIssue({
				code: 'custom',
				path: ['quoteToAccountRate'],
				message: `Required for ${currency} accounts so P&L and balance match MT5 (e.g. 18050 for IDR).`,
			});
		}
	});

export type AccountFormValues = z.infer<typeof accountFormSchema>;
export type AccountFormInput = z.input<typeof accountFormSchema>;

export const strategyFormSchema = z.object({
	name: z.string().trim().min(1, 'Strategy name is required.').max(120),
	description: optionalText(5000),
	rules: optionalText(10000),
	color: optionalText(32),
	isActive: z.boolean().default(true),
});

export type StrategyFormValues = z.infer<typeof strategyFormSchema>;
export type StrategyFormInput = z.input<typeof strategyFormSchema>;

export const symbolFormSchema = z.object({
	ticker: z.string().trim().min(1, 'Ticker is required.').max(32),
	name: z.string().trim().min(1, 'Name is required.').max(120),
	marketType: marketTypeSchema,
	baseAsset: optionalText(32),
	quoteAsset: optionalText(32),
	pipSize: optionalDecimalString,
	contractSize: optionalDecimalString,
	pricePrecision: requiredNonNegativeInt(12),
	isActive: z.boolean().default(true),
});

export type SymbolFormValues = z.infer<typeof symbolFormSchema>;
export type SymbolFormInput = z.input<typeof symbolFormSchema>;
