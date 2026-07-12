import type { z } from 'zod';
import { ValidationError } from './errors';

/** Parses `input` against `schema`, throwing a typed `ValidationError` (never a raw zod error). */
export function parseOrThrow<T>(schema: z.ZodType<T>, input: unknown): T {
	const result = schema.safeParse(input);
	if (!result.success) {
		throw new ValidationError(result.error.issues[0]?.message ?? 'Invalid input.');
	}
	return result.data;
}
