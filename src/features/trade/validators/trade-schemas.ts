import { z } from 'zod';
import { tradeSessionSchema, tradeSideSchema, tradeStatusSchema } from '@shared/validators';

/**
 * The single Trade form schema, shared by the Create/Edit React Hook Form resolver AND
 * re-validated server-side in the API routes (never trust client data). `result` is
 * intentionally absent — win/loss/breakeven is always derived by `TradingCalculatorService`,
 * never entered by hand.
 */
const emptyToUndefined = (value: unknown) => (value === '' || value === null ? undefined : value);

const uuidField = z.uuid({ error: 'Please select a value.' });
const optionalUuidField = z.preprocess(emptyToUndefined, uuidField.optional().nullable());

const requiredPositiveNumber = (message: string) =>
	z.preprocess(emptyToUndefined, z.coerce.number().positive(message));

const optionalPositiveNumber = z.preprocess(
	emptyToUndefined,
	z.coerce.number().positive('Must be greater than 0.').optional().nullable(),
);

const optionalNonNegativeNumber = z.preprocess(
	emptyToUndefined,
	z.coerce.number().min(0, 'Must be 0 or greater.').optional().nullable(),
);

const optionalText = (max: number) => z.string().max(max).optional().nullable();

export const tradeFormSchema = z
	.object({
		accountId: uuidField,
		symbolId: uuidField,
		strategyId: optionalUuidField,
		side: tradeSideSchema,
		status: tradeStatusSchema,
		session: z.preprocess(emptyToUndefined, tradeSessionSchema.optional().nullable()),
		entryPrice: requiredPositiveNumber('Entry price must be greater than 0.'),
		exitPrice: optionalPositiveNumber,
		stopLoss: optionalPositiveNumber,
		takeProfit: optionalPositiveNumber,
		quantity: requiredPositiveNumber('Quantity must be greater than 0.'),
		fees: optionalNonNegativeNumber,
		openedAt: z.string().min(1, 'Opened date is required.'),
		closedAt: z.preprocess(emptyToUndefined, z.string().optional().nullable()),
		tags: optionalText(1000),
		setup: optionalText(5000),
		mistakes: optionalText(5000),
		lessons: optionalText(5000),
	})
	.superRefine((data, ctx) => {
		if (data.status === 'closed') {
			if (data.exitPrice === null || data.exitPrice === undefined) {
				ctx.addIssue({
					code: 'custom',
					path: ['exitPrice'],
					message: 'Exit price is required for closed trades.',
				});
			}
			if (!data.closedAt) {
				ctx.addIssue({
					code: 'custom',
					path: ['closedAt'],
					message: 'Closed date is required for closed trades.',
				});
			}
		}

		if (data.openedAt && data.closedAt) {
			const opened = new Date(data.openedAt).getTime();
			const closed = new Date(data.closedAt).getTime();
			if (Number.isFinite(opened) && Number.isFinite(closed) && closed < opened) {
				ctx.addIssue({
					code: 'custom',
					path: ['closedAt'],
					message: 'Closed date must be after the opened date.',
				});
			}
		}
	});

export type TradeFormValues = z.infer<typeof tradeFormSchema>;

/**
 * Raw, pre-validation shape of every form control (native inputs only ever produce strings).
 * `zodResolver` coerces this into `TradeFormValues` on submit via the schema's preprocessors.
 */
export type TradeFormInput = z.input<typeof tradeFormSchema>;

export const tradeNoteFormSchema = z.object({
	title: optionalText(200),
	body: z.string().trim().min(1, 'Note cannot be empty.').max(20000),
	isPinned: z.boolean().default(false),
});

export type TradeNoteFormValues = z.infer<typeof tradeNoteFormSchema>;

/** Raw, pre-validation shape of the note form (mirrors `TradeFormInput`'s reasoning). */
export type TradeNoteFormInput = z.input<typeof tradeNoteFormSchema>;
