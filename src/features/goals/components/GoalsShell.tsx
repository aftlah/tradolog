import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, FeaturePageShell } from '@shared/components';
import { LogoutButton } from '@features/auth';
import type { AccountOption } from '@shared/types';
import { useGoals } from '../hooks/useGoals';
import type { GoalDto } from '../types/goals.types';
import { GoalFormDialog } from './GoalFormDialog';
import { GoalsList } from './GoalsList';

interface GoalsShellProps {
	initialGoals: GoalDto[];
	accounts: AccountOption[];
	activeAccountId: string | null;
	userName: string;
	userEmail: string;
}

/** Top-level Goals orchestrator: owns the goal list + Create/Edit dialog, renders `FeaturePageShell` chrome. */
export function GoalsShell({ initialGoals, accounts, activeAccountId, userName, userEmail }: GoalsShellProps) {
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
		<FeaturePageShell
			title="Goals"
			activeHref="/app/goals"
			accounts={accounts}
			activeAccountId={activeAccountId}
			userName={userName}
			userEmail={userEmail}
			userMenuFooter={<LogoutButton className="w-full" />}
		>
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
		</FeaturePageShell>
	);
}
