import { GlassCard, Skeleton } from '@shared/components';
import type { GoalDto } from '../types/goals.types';
import { GoalCard } from './GoalCard';

interface GoalsListProps {
	goals: GoalDto[];
	isLoading: boolean;
	onEdit: (goal: GoalDto) => void;
	onDeleted: () => void;
}

/** Card grid of monthly goals, each showing targets vs actuals progress bars. */
export function GoalsList({ goals, isLoading, onEdit, onDeleted }: GoalsListProps) {
	if (isLoading && goals.length === 0) {
		return (
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 3 }).map((_, index) => (
					<Skeleton key={index} className="h-72" />
				))}
			</div>
		);
	}

	if (goals.length === 0) {
		return (
			<GlassCard className="text-center">
				<p className="text-sm text-muted">No monthly goals yet. Create one to start tracking your progress.</p>
			</GlassCard>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{goals.map((goal) => (
				<GoalCard key={goal.id} goal={goal} onEdit={() => onEdit(goal)} onDeleted={onDeleted} />
			))}
		</div>
	);
}
