import { useState } from 'react';
import type { UseFormSetValue } from 'react-hook-form';
import { ClipboardPaste, Loader2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Textarea } from '@shared/components';
import { applySetupFormPatch } from '../utils/apply-setup-form-patch';
import { countFilledPatchFields, parseTradeEntryText } from '../utils/parse-trade-entry-text';
import type { TradeFormOptions } from '../types/trade.types';
import type { TradeFormInput } from '../validators/trade-schemas';

interface TradeEntryPasteFillProps {
	setValue: UseFormSetValue<TradeFormInput>;
	options: TradeFormOptions;
}

const PLACEHOLDER = `Contoh paste dari MT5 / chat:

GBPUSD
SELL LIMIT 0.02
Entry: 1.34271
SL: 1.34431
TP: 1.33957

atau satu baris:
GBPUSD short 1.34271 1.34431 1.33957 0.02`;

/** Paste several entry fields at once — symbol, side, entry, SL, TP, lots — and fill the form. */
export function TradeEntryPasteFill({ setValue, options }: TradeEntryPasteFillProps) {
	const [text, setText] = useState('');
	const [isApplying, setIsApplying] = useState(false);

	function handleApply() {
		setIsApplying(true);
		try {
			const patch = parseTradeEntryText(text, options.symbols);
			const detected = countFilledPatchFields(patch);
			if (detected === 0) {
				toast.error('Tidak ada field terdeteksi. Paste Entry / SL / TP / Lots (dan Symbol jika ada).');
				return;
			}

			const filled = applySetupFormPatch(setValue, patch);

			if (patch.unmatchedSymbol) {
				toast.warning(
					`Symbol “${patch.unmatchedSymbol}” belum ada di list. Tambah di Settings → Symbols, atau pilih manual.`,
				);
			}

			if (filled === 0) {
				toast.error('Field terdeteksi tapi gagal diisi. Coba format lain.');
				return;
			}

			toast.success(
				patch.matchedSymbol
					? `Terisi ${filled} field (${patch.matchedSymbol}). Cek dulu sebelum save.`
					: `Terisi ${filled} field. Cek dulu sebelum save.`,
			);
			setText('');
		} finally {
			setIsApplying(false);
		}
	}

	return (
		<div className="glass-card space-y-4 p-5">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<p className="text-sm font-medium text-foreground">Paste entry (isi otomatis)</p>
					<p className="mt-1 text-xs text-muted">
						Kirim beberapa field sekaligus — symbol, buy/sell, entry, SL, TP, lots — form terisi otomatis.
					</p>
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="gap-1.5 shrink-0"
					disabled={isApplying || text.trim().length === 0}
					aria-busy={isApplying}
					onClick={handleApply}
				>
					{isApplying ? (
						<Loader2 className="size-4 animate-spin" aria-hidden="true" />
					) : (
						<Wand2 className="size-4" aria-hidden="true" />
					)}
					Isi form
				</Button>
			</div>
			<label className="block">
				<span className="sr-only">Paste trade entry text</span>
				<Textarea
					value={text}
					onChange={(event) => setText(event.target.value)}
					rows={5}
					placeholder={PLACEHOLDER}
					className="font-mono text-xs"
				/>
			</label>
			<p className="flex items-start gap-2 text-[11px] text-muted">
				<ClipboardPaste className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
				Bisa copy dari MT5 / WhatsApp / catatan. Harga IDR P&amp;L besar diabaikan — yang dibaca harga + lots.
			</p>
		</div>
	);
}
