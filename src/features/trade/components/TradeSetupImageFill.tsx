import { useRef, useState } from 'react';
import type { UseFormSetValue } from 'react-hook-form';
import { ImagePlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@shared/components';
import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_SIZE_BYTES, PARSE_SETUP_API_ROUTE } from '../constants/trade.constants';
import type { TradeFormInput } from '../validators/trade-schemas';
import type { SetupFormPatch } from '../validators/setup-parse-schemas';

interface TradeSetupImageFillProps {
	setValue: UseFormSetValue<TradeFormInput>;
}

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

/**
 * Transient setup screenshot → Gemini → form fields.
 * The file never leaves this request; it is not saved to R2/DB.
 */
export function TradeSetupImageFill({ setValue }: TradeSetupImageFillProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isParsing, setIsParsing] = useState(false);

	async function handleFile(file: File | undefined) {
		if (!file) {
			return;
		}

		if (!(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) {
			toast.error('Use a PNG, JPEG, WebP, or GIF image.');
			return;
		}
		if (file.size > MAX_IMAGE_SIZE_BYTES) {
			toast.error('Image must be under 5 MB.');
			return;
		}

		setIsParsing(true);
		try {
			const body = new FormData();
			body.append('image', file);

			const response = await fetch(PARSE_SETUP_API_ROUTE, {
				method: 'POST',
				body,
			});
			const payload: unknown = await response.json().catch(() => null);
			if (!response.ok) {
				const message =
					typeof payload === 'object' && payload !== null && 'error' in payload
						? String((payload as { error: unknown }).error)
						: 'Could not read this setup image.';
				throw new Error(message);
			}

			const patch = (payload as { patch: SetupFormPatch }).patch;
			let filled = 0;
			for (const key of FILLABLE_KEYS) {
				const value = patch[key];
				if (value === undefined || value === null || value === '') {
					continue;
				}
				setValue(key, value, { shouldDirty: true, shouldValidate: true });
				filled += 1;
			}

			if (patch.unmatchedSymbol) {
				toast.warning(
					`Read symbol “${patch.unmatchedSymbol}” but it is not in your Symbols list. Add it under Settings → Symbols.`,
				);
			}

			if (filled === 0) {
				toast.error(patch.notes ?? 'No trade fields were detected. Try a clearer screenshot.');
				return;
			}

			toast.success(
				patch.matchedSymbol
					? `Filled ${filled} field(s) from setup (${patch.matchedSymbol}). Review before saving.`
					: `Filled ${filled} field(s) from setup. Review before saving.`,
			);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Could not read this setup image.');
		} finally {
			setIsParsing(false);
			if (inputRef.current) {
				inputRef.current.value = '';
			}
		}
	}

	return (
		<div className="glass-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<p className="text-sm font-medium text-foreground">Fill from setup image</p>
				<p className="mt-1 text-xs text-muted">
					Upload a chart/setup screenshot — fields are filled automatically. The image is not saved.
				</p>
			</div>
			<div>
				<input
					ref={inputRef}
					type="file"
					accept={ALLOWED_IMAGE_MIME_TYPES.join(',')}
					className="sr-only"
					onChange={(event) => {
						void handleFile(event.target.files?.[0]);
					}}
				/>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="gap-1.5"
					disabled={isParsing}
					aria-busy={isParsing}
					onClick={() => inputRef.current?.click()}
				>
					{isParsing ? (
						<Loader2 className="size-4 animate-spin" aria-hidden="true" />
					) : (
						<ImagePlus className="size-4" aria-hidden="true" />
					)}
					{isParsing ? 'Reading setup…' : 'Choose image'}
				</Button>
			</div>
		</div>
	);
}
