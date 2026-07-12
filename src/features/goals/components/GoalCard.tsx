import { useState } from 'react';
import { toast } from 'sonner';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
	Badge,
	Button,
	ConfirmDialog,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	GlassCard,
} from '@shared/components';
import { formatNumber, formatPercent, formatSignedCurrency } from '@shared/utils/format';
import { GOALS_API_ROUTE, GOAL_STATUS_BADGE, MONTH_LABELS } from '../constants/goals.constants';
import type { GoalDto } from '../types/goals.types';
import { GoalProgressBar } from './GoalProgressBar';

interface GoalCardProps {
	goal: GoalDto;
	onEdit: () => void;
	onDeleted: () => void;
}

export function GoalCard({ goal, onEdit, onDeleted }: GoalCardProps) {
	const [confirmOpen, setConfirmOpen] = useState(false);
	const statusBadge = GOAL_STATUS_BADGE[goal.status];

	async function handleDelete() {
		const response = await fetch(`${GOALS_API_ROUTE}/${goal.id}`, { method: 'DELETE' });
		if (!response.ok) {
			toast.error('Could not delete this goal. Please try again.');
			return;
		}
		toast.success('Goal deleted.');
		onDeleted();
	}

	return (
		<GlassCard className="flex h-full flex-col gap-5">
			<div className="flex items-start justify-between gap-2">
				<div>
					<p className="text-xs text-muted">
						{MONTH_LABELS[goal.month]} {goal.year}
					</p>
					<h3 className="mt-0.5 text-base font-semibold text-foreground">{goal.title}</h3>
				</div>
				<div className="flex items-center gap-2">
					<Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" aria-label="Goal actions">
								<MoreHorizontal className="size-4" aria-hidden="true" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onSelect={(event) => {
									event.preventDefault();
									onEdit();
								}}
							>
								<Pencil aria-hidden="true" /> Edit
							</DropdownMenuItem>
							<DropdownMenuItem
								variant="destructive"
								onSelect={(event) => {
									event.preventDefault();
									setConfirmOpen(true);
								}}
							>
								<Trash2 aria-hidden="true" /> Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{goal.description ? <p className="text-sm text-muted">{goal.description}</p> : null}

			<div className="space-y-4">
				<GoalProgressBar
					label="Profit"
					actualLabel={formatSignedCurrency(goal.actualProfit)}
					targetLabel={goal.targetProfit !== null ? formatSignedCurrency(goal.targetProfit) : null}
					percent={goal.profitProgressPercent}
					isMet={goal.isProfitTargetMet}
				/>
				<GoalProgressBar
					label="Win Rate"
					actualLabel={formatPercent(goal.actualWinRate)}
					targetLabel={goal.targetWinRate !== null ? formatPercent(goal.targetWinRate) : null}
					percent={goal.winRateProgressPercent}
					isMet={goal.isWinRateTargetMet}
				/>
				<GoalProgressBar
					label="Trades"
					actualLabel={formatNumber(goal.actualTradeCount)}
					targetLabel={goal.targetTradeCount !== null ? formatNumber(goal.targetTradeCount) : null}
					percent={goal.tradeCountProgressPercent}
					isMet={goal.isTradeCountTargetMet}
				/>
				<div className="flex items-baseline justify-between gap-2 text-xs">
					<span className="text-muted">Max Drawdown</span>
					<span className={goal.isWithinDrawdownLimit ? 'font-medium text-foreground' : 'font-medium text-danger'}>
						{formatPercent(goal.actualMaxDrawdownPercent)}
						{goal.maxDrawdownPercent !== null ? (
							<span className="text-muted"> / {formatPercent(goal.maxDrawdownPercent)} limit</span>
						) : null}
					</span>
				</div>
			</div>

			<ConfirmDialog
				open={confirmOpen}
				onOpenChange={setConfirmOpen}
				title="Delete this goal?"
				description="This removes the monthly goal permanently. This action cannot be undone."
				onConfirm={handleDelete}
			/>
		</GlassCard>
	);
}
