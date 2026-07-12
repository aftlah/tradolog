import { z } from 'zod';
import { goalStatusSchema } from '@shared/validators';

/**
 * The Create/Edit Goal form schema. Unlike `monthlyGoalInsertSchema` (which stores numeric
 * columns as regex-checked strings for the DB), this form works with real numbers so native
 * number inputs and the RHF resolver stay simple — `GoalsService` re-validates the DB-shape via
 * the shared schema before writing, so client input is never trusted as-is.
 */
const emptyToUndefined = (value: unknown) => (value === '' || value === null ? undefined : value);

const optionalPercent = z.preprocess(
	emptyToUndefined,
	z.coerce.number().min(0, 'Must be 0 or greater.').max(100, 'Must be 100 or less.').optional().nullable(),
);

const optionalNonNegativeNumber = z.preprocess(
	emptyToUndefined,
	z.coerce.number().min(0, 'Must be 0 or greater.').optional().nullable(),
);

const optionalNonNegativeInt = z.preprocess(
	emptyToUndefined,
	z.coerce.number().int().min(0, 'Must be 0 or greater.').optional().nullable(),
);

export const goalFormSchema = z.object({
	year: z.coerce.number().int().min(2000, 'Invalid year.').max(2100, 'Invalid year.'),
	month: z.coerce.number().int().min(1, 'Invalid month.').max(12, 'Invalid month.'),
	title: z.string().trim().min(1, 'Title is required.').max(200),
	description: z.preprocess(emptyToUndefined, z.string().max(5000).optional().nullable()),
	targetProfit: optionalNonNegativeNumber,
	targetWinRate: optionalPercent,
	targetTradeCount: optionalNonNegativeInt,
	maxDrawdownPercent: optionalPercent,
	status: goalStatusSchema.default('active'),
});

export type GoalFormValues = z.infer<typeof goalFormSchema>;

/** Raw, pre-validation shape of every form control (native inputs only ever produce strings). */
export type GoalFormInput = z.input<typeof goalFormSchema>;
