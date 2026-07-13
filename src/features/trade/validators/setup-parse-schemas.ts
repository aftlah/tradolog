import { z } from 'zod';

const emptyToNull = (value: unknown) => {
	if (value === '' || value === null || value === undefined) {
		return null;
	}
	return value;
};

const optionalNumber = z.preprocess(emptyToNull, z.coerce.number().positive().nullable().optional());
const optionalNonNegative = z.preprocess(emptyToNull, z.coerce.number().min(0).nullable().optional());
const optionalText = z.preprocess(emptyToNull, z.string().trim().min(1).max(5000).nullable().optional());

export const setupParseResultSchema = z.object({
	symbol: z.preprocess(emptyToNull, z.string().trim().max(64).nullable().optional()),
	side: z.preprocess(
		emptyToNull,
		z.enum(['long', 'short', 'buy', 'sell']).nullable().optional(),
	),
	status: z.preprocess(
		emptyToNull,
		z.enum(['planned', 'open', 'closed', 'cancelled']).nullable().optional(),
	),
	session: z.preprocess(
		emptyToNull,
		z.enum(['asian', 'london', 'new_york', 'overlap']).nullable().optional(),
	),
	entryPrice: optionalNumber,
	exitPrice: optionalNumber,
	stopLoss: optionalNumber,
	takeProfit: optionalNumber,
	quantity: optionalNumber,
	fees: optionalNonNegative,
	openedAt: optionalText,
	closedAt: optionalText,
	setup: optionalText,
	tags: optionalText,
	confidence: z.preprocess(emptyToNull, z.coerce.number().min(0).max(1).nullable().optional()),
	notes: optionalText,
});

export type SetupParseResult = z.infer<typeof setupParseResultSchema>;

/** Fields applied to the trade form after symbol/strategy resolution. */
export interface SetupFormPatch {
	symbolId?: string;
	side?: 'long' | 'short';
	status?: 'planned' | 'open' | 'closed' | 'cancelled';
	session?: 'asian' | 'london' | 'new_york' | 'overlap' | '';
	entryPrice?: string;
	exitPrice?: string;
	stopLoss?: string;
	takeProfit?: string;
	quantity?: string;
	fees?: string;
	openedAt?: string;
	closedAt?: string;
	setup?: string;
	tags?: string;
	matchedSymbol?: string | null;
	unmatchedSymbol?: string | null;
	confidence?: number | null;
	notes?: string | null;
}
