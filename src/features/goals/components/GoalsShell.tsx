import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@shared/components';
import { useGoals } from '../hooks/useGoals';
import type { GoalDto } from '../types/goals.types';
import { GoalFormDialog } from './GoalFormDialog';
import { GoalsList } from './GoalsList';

interface GoalsShellProps {
	initialGoals: GoalDto[];
	activeAccountId: string | null;
}

/** Goals page body — chrome lives in the persisted `AppLayout` shell. */
export function GoalsShell({ initialGoals, activeAccountId }: GoalsShellProps) {
	const { goals, isLoading, refetch } = useGoals({ initialGoals, accountId: activeAccountId });
	const [formOpen, setFormOpen] = useState(false);
	const [editingGoal, setEditingGoal] = useState<GoalDto | null>(null);

	function openCreateDialog() {
		setEditingGoal(null);
		setFormOpen(true);
	}

	function openEditDialog(goal: GoalDto) {
		setEditingGoal(goal);
		setFormOpen(true);
	}

	return (
		<>
			<div className="flex items-center justify-between gap-3">
				<p className="text-sm text-muted">
					{goals.length === 0 ? 'No monthly goals yet' : `${goals.length} monthly goal${goals.length === 1 ? '' : 's'}`}
				</p>
				<Button onClick={openCreateDialog} className="gap-2">
					<Plus className="size-4" aria-hidden="true" />
					New Goal
				</Button>
			</div>

			<GoalsList goals={goals} isLoading={isLoading} onEdit={openEditDialog} onDeleted={refetch} />

			<GoalFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				goal={editingGoal}
				onSaved={() => {
					setFormOpen(false);
					void refetch();
				}}
			/>
		</>
	);
}
