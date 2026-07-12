import { useState } from 'react';
import { toast } from 'sonner';
import { Lock, Pencil, Plus, Trash2, TrendingUp } from 'lucide-react';
import { Badge, Button, ConfirmDialog } from '@shared/components';
import { MARKET_TYPE_OPTIONS, SETTINGS_SYMBOLS_API_ROUTE } from '../constants/settings.constants';
import type { SymbolSettingsDto } from '../types/settings.types';
import { SymbolFormDialog } from './SymbolFormDialog';

interface SymbolsSettingsPanelProps {
	symbols: SymbolSettingsDto[];
	onSymbolsChange: (symbols: SymbolSettingsDto[]) => void;
}

const MARKET_TYPE_LABEL = new Map(MARKET_TYPE_OPTIONS.map((option) => [option.value, option.label]));

/** Lists symbols (system catalog + user-owned). Only user-owned symbols may be edited/deleted. */
export function SymbolsSettingsPanel({ symbols, onSymbolsChange }: SymbolsSettingsPanelProps) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingSymbol, setEditingSymbol] = useState<SymbolSettingsDto | null>(null);
	const [deletingSymbol, setDeletingSymbol] = useState<SymbolSettingsDto | null>(null);

	function handleAddClick() {
		setEditingSymbol(null);
		setDialogOpen(true);
	}

	function handleEditClick(symbol: SymbolSettingsDto) {
		setEditingSymbol(symbol);
		setDialogOpen(true);
	}

	function handleSaved(saved: SymbolSettingsDto) {
		const exists = symbols.some((symbol) => symbol.id === saved.id);
		onSymbolsChange(exists ? symbols.map((symbol) => (symbol.id === saved.id ? saved : symbol)) : [saved, ...symbols]);
	}

	async function handleDelete() {
		if (!deletingSymbol) {
			return;
		}
		const response = await fetch(`${SETTINGS_SYMBOLS_API_ROUTE}/${deletingSymbol.id}`, { method: 'DELETE' });
		if (!response.ok) {
			toast.error('Could not delete this symbol. Please try again.');
			return;
		}
		onSymbolsChange(symbols.filter((symbol) => symbol.id !== deletingSymbol.id));
		toast.success('Symbol deleted.');
	}

	return (
		<div className="glass-card p-6">
			<div className="mb-5 flex items-center justify-between">
				<div>
					<h2 className="text-sm font-medium text-muted">Symbols</h2>
					<p className="mt-1 text-xs text-muted">Instruments available when logging trades. You can only edit symbols you added.</p>
				</div>
				<Button type="button" size="sm" onClick={handleAddClick} className="gap-1.5">
					<Plus className="size-4" aria-hidden="true" />
					Add Symbol
				</Button>
			</div>

			{symbols.length === 0 ? (
				<p className="py-10 text-center text-sm text-muted">No symbols yet. Add your first instrument to start logging trades.</p>
			) : (
				<div className="space-y-3">
					{symbols.map((symbol) => (
						<div
							key={symbol.id}
							className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
						>
							<div className="flex items-start gap-3">
								<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
									<TrendingUp className="size-4.5" aria-hidden="true" />
								</div>
								<div>
									<div className="flex items-center gap-2">
										<p className="font-medium text-foreground">{symbol.ticker}</p>
										<Badge variant="muted">{MARKET_TYPE_LABEL.get(symbol.marketType) ?? symbol.marketType}</Badge>
										{!symbol.isActive ? <Badge variant="muted">Inactive</Badge> : null}
										{!symbol.isOwnedByUser ? (
											<Badge variant="default" className="gap-1">
												<Lock className="size-3" aria-hidden="true" />
												System
											</Badge>
										) : null}
									</div>
									<p className="mt-1 text-xs text-muted">{symbol.name}</p>
								</div>
							</div>

							{symbol.isOwnedByUser ? (
								<div className="flex items-center gap-2 self-end sm:self-auto">
									<Button type="button" variant="outline" size="sm" onClick={() => handleEditClick(symbol)} className="gap-1.5">
										<Pencil className="size-3.5" aria-hidden="true" />
										Edit
									</Button>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										aria-label="Delete symbol"
										onClick={() => setDeletingSymbol(symbol)}
									>
										<Trash2 className="size-4" aria-hidden="true" />
									</Button>
								</div>
							) : null}
						</div>
					))}
				</div>
			)}

			<SymbolFormDialog open={dialogOpen} onOpenChange={setDialogOpen} symbol={editingSymbol} onSaved={handleSaved} />

			<ConfirmDialog
				open={deletingSymbol !== null}
				onOpenChange={(open) => (open ? null : setDeletingSymbol(null))}
				title="Delete this symbol?"
				description="Trades already logged with this symbol keep their history; it will no longer be selectable."
				onConfirm={handleDelete}
			/>
		</div>
	);
}
