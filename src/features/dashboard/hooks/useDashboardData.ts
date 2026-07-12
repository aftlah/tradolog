import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { DASHBOARD_API_ROUTE } from '../constants/dashboard.constants';
import type { DashboardData } from '../types/dashboard.types';

interface UseDashboardDataResult {
	data: DashboardData;
	isLoading: boolean;
	switchAccount: (accountId: string) => Promise<void>;
}


export function useDashboardData(initialData: DashboardData): UseDashboardDataResult {
	const [data, setData] = useState(initialData);
	const [isLoading, setIsLoading] = useState(false);

	const switchAccount = useCallback(
		async (accountId: string) => {
			if (accountId === data.activeAccountId) {
				return;
			}

			setIsLoading(true);
			try {
				const response = await fetch(`${DASHBOARD_API_ROUTE}?accountId=${encodeURIComponent(accountId)}`);
				if (!response.ok) {
					throw new Error('Failed to load account.');
				}
				const next = (await response.json()) as DashboardData;
				setData(next);
			} catch {
				toast.error('Could not switch accounts. Please try again.');
			} finally {
				setIsLoading(false);
			}
		},
		[data.activeAccountId],
	);

	return { data, isLoading, switchAccount };
}
