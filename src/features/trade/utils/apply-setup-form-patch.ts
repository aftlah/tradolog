import type { UseFormSetValue } from 'react-hook-form';
import type { TradeFormInput } from '../validators/trade-schemas';
import type { SetupFormPatch } from '../validators/setup-parse-schemas';

const FILLABLE_KEYS = [
	'symbolId',
	'side',
	'status',
	'session',
	'entryPrice',
	'exitPrice',
	'stopLoss',
	'takeProfit',
	'quantity',
	'fees',
	'openedAt',
	'closedAt',
	'setup',
	'tags',
] as const satisfies ReadonlyArray<keyof SetupFormPatch & keyof TradeFormInput>;

/** Apply a setup/parse patch onto the react-hook-form trade form. Returns number of fields written. */
export function applySetupFormPatch(
	setValue: UseFormSetValue<TradeFormInput>,
	patch: SetupFormPatch,
): number {
	let filled = 0;
	for (const key of FILLABLE_KEYS) {
		const value = patch[key];
		if (value === undefined || value === null || value === '') {
			continue;
		}
		setValue(key, value, { shouldDirty: true, shouldValidate: true });
		filled += 1;
	}
	return filled;
}

export { FILLABLE_KEYS };
