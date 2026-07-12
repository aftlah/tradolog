import { useState } from 'react';
import { toast } from 'sonner';
import { ListTree, Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge, Button, ConfirmDialog } from '@shared/components';
import { SETTINGS_STRATEGIES_API_ROUTE } from '../constants/settings.constants';
import type { StrategySettingsDto } from '../types/settings.types';
import { StrategyFormDialog } from './StrategyFormDialog';

interface StrategiesSettingsPanelProps {
	strategies: StrategySettingsDto[];
	onStrategiesChange: (strategies: StrategySettingsDto[]) => void;
}

/** Lists trading strategies/playbooks with create/edit/delete. */
export function StrategiesSettingsPanel({ strategies, onStrategiesChange }: StrategiesSettingsPanelProps) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingStrategy, setEditingStrategy] = useState<StrategySettingsDto | null>(null);
	const [deletingStrategy, setDeletingStrategy] = useState<StrategySettingsDto | null>(null);

	function handleAddClick() {
		setEditingStrategy(null);
		setDialogOpen(true);
	}

	function handleEditClick(strategy: StrategySettingsDto) {
		setEditingStrategy(strategy);
		setDialogOpen(true);
	}

	function handleSaved(saved: StrategySettingsDto) {
		const exists = strategies.some((strategy) => strategy.id === saved.id);
		onStrategiesChange(
			exists ? strategies.map((strategy) => (strategy.id === saved.id ? saved : strategy)) : [saved, ...strategies],
		);
	}

	async function handleDelete() {
		if (!deletingStrategy) {
			return;
		}
		const response = await fetch(`${SETTINGS_STRATEGIES_API_ROUTE}/${deletingStrategy.id}`, { method: 'DELETE' });
		if (!response.ok) {
			toast.error('Could not delete this strategy. Please try again.');
			return;
		}
		onStrategiesChange(strategies.filter((strategy) => strategy.id !== deletingStrategy.id));
		toast.success('Strategy deleted.');
	}

	return (
		<div className="glass-card p-6">
			<div className="mb-5 flex items-center justify-between">
				<div>
					<h2 className="text-sm font-medium text-muted">Strategies</h2>
					<p className="mt-1 text-xs text-muted">Playbooks you can attach to trades when journaling setups.</p>
				</div>
				<Button type="button" size="sm" onClick={handleAddClick} className="gap-1.5">
					<Plus className="size-4" aria-hidden="true" />
					Add Strategy
				</Button>
			</div>

			{strategies.length === 0 ? (
				<p className="py-10 text-center text-sm text-muted">No strategies yet. Add your first playbook to tag your trades.</p>
			) : (
				<div className="space-y-3">
					{strategies.map((strategy) => (
						<div
							key={strategy.id}
							className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
						>
							<div className="flex items-start gap-3">
								<div
									className="flex size-9 shrink-0 items-center justify-center rounded-xl"
									style={{ backgroundColor: `${strategy.color ?? '#2563EB'}1a`, color: strategy.color ?? '#2563EB' }}
								>
									<ListTree className="size-4.5" aria-hidden="true" />
								</div>
								<div>
									<div className="flex items-center gap-2">
										<p className="font-medium text-foreground">{strategy.name}</p>
										{!strategy.isActive ? <Badge variant="muted">Inactive</Badge> : null}
									</div>
									{strategy.description ? <p className="mt-1 text-xs text-muted">{strategy.description}</p> : null}
								</div>
							</div>

							<div className="flex items-center gap-2 self-end sm:self-auto">
								<Button type="button" variant="outline" size="sm" onClick={() => handleEditClick(strategy)} className="gap-1.5">
									<Pencil className="size-3.5" aria-hidden="true" />
									Edit
								</Button>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									aria-label="Delete strategy"
									onClick={() => setDeletingStrategy(strategy)}
								>
									<Trash2 className="size-4" aria-hidden="true" />
								</Button>
							</div>
						</div>
					))}
				</div>
			)}

			<StrategyFormDialog open={dialogOpen} onOpenChange={setDialogOpen} strategy={editingStrategy} onSaved={handleSaved} />

			<ConfirmDialog
				open={deletingStrategy !== null}
				onOpenChange={(open) => (open ? null : setDeletingStrategy(null))}
				title="Delete this strategy?"
				description="Trades already tagged with this strategy keep their history; the strategy will no longer be selectable."
				onConfirm={handleDelete}
			/>
		</div>
	);
}
