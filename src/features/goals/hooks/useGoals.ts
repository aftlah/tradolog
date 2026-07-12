import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { GOALS_API_ROUTE } from '../constants/goals.constants';
import type { GoalDto } from '../types/goals.types';

interface UseGoalsOptions {
	initialGoals: GoalDto[];
	accountId: string | null;
}

interface UseGoalsResult {
	goals: GoalDto[];
	isLoading: boolean;
	refetch: () => Promise<void>;
}

/** Owns the Goals list's client-side state and refetches `/api/goals` after create/update/delete. */
export function useGoals({ initialGoals, accountId }: UseGoalsOptions): UseGoalsResult {
	const [goals, setGoals] = useState<GoalDto[]>(initialGoals);
	const [isLoading, setIsLoading] = useState(false);

	const refetch = useCallback(async () => {
		setIsLoading(true);
		try {
			const params = accountId ? `?accountId=${encodeURIComponent(accountId)}` : '';
			const response = await fetch(`${GOALS_API_ROUTE}${params}`);
			if (!response.ok) {
				throw new Error('Failed to load goals.');
			}
			const next = (await response.json()) as GoalDto[];
			setGoals(next);
		} catch {
			toast.error('Could not load goals. Please try again.');
		} finally {
			setIsLoading(false);
		}
	}, [accountId]);

	return { goals, isLoading, refetch };
}
