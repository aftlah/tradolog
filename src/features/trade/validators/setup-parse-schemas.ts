import { z } from 'zod';

const emptyToNull = (value: unknown) => {
	if (value === '' || value === null || value === undefined) {
		return null;
	}
	return value;
};

/** Accept `4 036.80` / `4036,80` from OCR-ish Gemini output. */
const looseNumber = (value: unknown): unknown => {
	if (value === '' || value === null || value === undefined) {
		return null;
	}
	if (typeof value === 'number') {
		return value;
	}
	if (typeof value === 'string') {
		const cleaned = value.trim().replace(/\s/g, '').replace(/,(?=\d{3}\b)/g, '').replace(',', '.');
		const parsed = Number.parseFloat(cleaned);
		return Number.isFinite(parsed) ? parsed : value;
	}
	return value;
};

const optionalNumber = z.preprocess(looseNumber, z.number().positive().nullable().optional());
const optionalNonNegative = z.preprocess(looseNumber, z.number().min(0).nullable().optional());
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

/** Gemini may return a single trade object or `{ trades: [...] }` for MT5 history lists. */
export const setupParseEnvelopeSchema = z.preprocess((raw) => {
	if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
		return raw;
	}
	const record = raw as Record<string, unknown>;
	if (Array.isArray(record.trades)) {
		return record;
	}
	if (Array.isArray(record.positions)) {
		return { trades: record.positions };
	}
	return { trades: [record] };
}, z.object({
	trades: z.array(setupParseResultSchema).min(1).max(30),
}));

export type SetupParseResult = z.infer<typeof setupParseResultSchema>;
export type SetupParseEnvelope = z.infer<typeof setupParseEnvelopeSchema>;

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
	/** Short label for multi-trade pickers (e.g. "XAUUSD sell 4036.80→4036.03"). */
	label?: string;
}
