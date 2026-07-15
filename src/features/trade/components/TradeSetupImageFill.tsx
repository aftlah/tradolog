import { useRef, useState } from 'react';
import type { UseFormSetValue } from 'react-hook-form';
import { Check, ImagePlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@shared/components';
import { softNavigate } from '@shared/utils/soft-navigate';
import {
	ALLOWED_IMAGE_MIME_TYPES,
	MAX_IMAGE_SIZE_BYTES,
	PARSE_SETUP_API_ROUTE,
	TRADES_API_ROUTE,
} from '../constants/trade.constants';
import { applySetupFormPatch } from '../utils/apply-setup-form-patch';
import { buildTradePayloadFromPatch } from '../utils/build-trade-payload-from-patch';
import type { TradeFormInput } from '../validators/trade-schemas';
import type { SetupFormPatch } from '../validators/setup-parse-schemas';

interface TradeSetupImageFillProps {
	setValue: UseFormSetValue<TradeFormInput>;
	accountId: string;
}

/**
 * Transient screenshot → Gemini → form fields (single) or direct create (multi).
 * The file is never saved to R2/DB.
 */
export function TradeSetupImageFill({ setValue, accountId }: TradeSetupImageFillProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isParsing, setIsParsing] = useState(false);
	const [patches, setPatches] = useState<SetupFormPatch[]>([]);
	const [submittedIndexes, setSubmittedIndexes] = useState<Set<number>>(() => new Set());
	const [submittingIndex, setSubmittingIndex] = useState<number | null>(null);
	const [isSubmittingAll, setIsSubmittingAll] = useState(false);

	function applyPatch(patch: SetupFormPatch) {
		const filled = applySetupFormPatch(setValue, patch);
		if (patch.unmatchedSymbol) {
			toast.warning(
				`Symbol “${patch.unmatchedSymbol}” belum ada di list. Tambah di Settings → Symbols.`,
			);
		}
		if (filled === 0) {
			toast.error(patch.notes ?? 'No trade fields were detected for this row.');
			return;
		}
		toast.success(
			patch.matchedSymbol
				? `Terisi ${filled} field (${patch.label ?? patch.matchedSymbol}). Cek dulu sebelum save.`
				: `Terisi ${filled} field. Cek dulu sebelum save.`,
		);
	}

	async function submitPatch(patch: SetupFormPatch, index: number): Promise<boolean> {
		if (!accountId) {
			toast.error('Pilih account dulu di form.');
			return false;
		}

		const built = buildTradePayloadFromPatch(accountId, patch);
		if (!built.ok) {
			toast.error(built.error);
			return false;
		}

		const response = await fetch(TRADES_API_ROUTE, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(built.payload),
		});

		if (!response.ok) {
			const payload: unknown = await response.json().catch(() => null);
			const message =
				typeof payload === 'object' && payload !== null && 'error' in payload
					? String((payload as { error: unknown }).error)
					: 'Gagal menyimpan trade.';
			throw new Error(message);
		}

		setSubmittedIndexes((prev) => new Set(prev).add(index));
		return true;
	}

	async function handleSubmitOne(patch: SetupFormPatch, index: number) {
		if (submittedIndexes.has(index) || submittingIndex !== null || isSubmittingAll) {
			return;
		}
		setSubmittingIndex(index);
		try {
			const ok = await submitPatch(patch, index);
			if (ok) {
				toast.success(patch.label ? `Tersimpan: ${patch.label}` : 'Trade tersimpan.');
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Gagal menyimpan trade.');
		} finally {
			setSubmittingIndex(null);
		}
	}

	async function handleSubmitAll() {
		if (!accountId) {
			toast.error('Pilih account dulu di form.');
			return;
		}
		if (isSubmittingAll || submittingIndex !== null) {
			return;
		}

		const pending = patches
			.map((patch, index) => ({ patch, index }))
			.filter(({ index }) => !submittedIndexes.has(index));

		if (pending.length === 0) {
			toast.message('Semua baris sudah disubmit.');
			return;
		}

		setIsSubmittingAll(true);
		let successCount = 0;
		let failCount = 0;

		try {
			for (const { patch, index } of pending) {
				setSubmittingIndex(index);
				try {
					const ok = await submitPatch(patch, index);
					if (ok) {
						successCount += 1;
					} else {
						failCount += 1;
					}
				} catch {
					failCount += 1;
				}
			}

			if (successCount > 0 && failCount === 0) {
				toast.success(`${successCount} trade tersimpan.`);
				await softNavigate('/app/trades');
			} else if (successCount > 0) {
				toast.warning(`${successCount} tersimpan, ${failCount} gagal.`);
			} else {
				toast.error('Tidak ada trade yang tersimpan.');
			}
		} finally {
			setSubmittingIndex(null);
			setIsSubmittingAll(false);
		}
	}

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
		setPatches([]);
		setSubmittedIndexes(new Set());
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
						: 'Could not read this image.';
				throw new Error(message);
			}

			const data = payload as { patches?: SetupFormPatch[]; patch?: SetupFormPatch };
			const nextPatches =
				Array.isArray(data.patches) && data.patches.length > 0
					? data.patches
					: data.patch
						? [data.patch]
						: [];

			if (nextPatches.length === 0) {
				toast.error('No trades were detected. Try a clearer screenshot.');
				return;
			}

			setPatches(nextPatches);

			if (nextPatches.length === 1) {
				applyPatch(nextPatches[0]!);
				return;
			}

			toast.success(`${nextPatches.length} trade terdeteksi. Submit per baris atau semua sekaligus.`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Could not read this image.');
		} finally {
			setIsParsing(false);
			if (inputRef.current) {
				inputRef.current.value = '';
			}
		}
	}

	const pendingCount = patches.filter((_, index) => !submittedIndexes.has(index)).length;
	const busy = isParsing || submittingIndex !== null || isSubmittingAll;

	return (
		<div className="glass-card space-y-4 p-5">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-sm font-medium text-foreground">Fill from image</p>
					<p className="mt-1 text-xs text-muted">
						Chart/setup isi form; list MT5 bisa langsung submit per baris. Gambar tidak disimpan.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					{patches.length > 1 && pendingCount > 0 ? (
						<Button
							type="button"
							size="sm"
							variant="secondary"
							disabled={busy || !accountId}
							aria-busy={isSubmittingAll}
							onClick={() => {
								void handleSubmitAll();
							}}
						>
							{isSubmittingAll ? (
								<Loader2 className="size-4 animate-spin" aria-hidden="true" />
							) : null}
							Submit all ({pendingCount})
						</Button>
					) : null}
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
						disabled={busy}
						aria-busy={isParsing}
						onClick={() => inputRef.current?.click()}
					>
						{isParsing ? (
							<Loader2 className="size-4 animate-spin" aria-hidden="true" />
						) : (
							<ImagePlus className="size-4" aria-hidden="true" />
						)}
						{isParsing ? 'Reading…' : 'Choose image'}
					</Button>
				</div>
			</div>

			{patches.length > 1 ? (
				<ul className="space-y-2" aria-label="Detected trades">
					{patches.map((patch, index) => {
						const isSubmitted = submittedIndexes.has(index);
						const isRowSubmitting = submittingIndex === index;
						return (
							<li
								key={`${patch.label ?? 'trade'}-${index}`}
								className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
							>
								<div className="min-w-0">
									<p className="truncate text-sm font-medium text-foreground">
										{patch.label ?? `Trade ${index + 1}`}
									</p>
									<p className="text-[11px] text-muted">
										{[
											patch.side,
											patch.quantity ? `${patch.quantity} lot` : null,
											patch.status,
										]
											.filter(Boolean)
											.join(' · ')}
									</p>
								</div>
								<Button
									type="button"
									size="sm"
									variant={isSubmitted ? 'secondary' : 'default'}
									className="gap-1.5 shrink-0"
									disabled={busy || isSubmitted || !accountId}
									aria-busy={isRowSubmitting}
									onClick={() => {
										void handleSubmitOne(patch, index);
									}}
								>
									{isRowSubmitting ? (
										<Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
									) : isSubmitted ? (
										<Check className="size-3.5" aria-hidden="true" />
									) : null}
									{isSubmitted ? 'Submitted' : isRowSubmitting ? 'Saving…' : 'Submit'}
								</Button>
							</li>
						);
					})}
				</ul>
			) : null}
		</div>
	);
}
