import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { persistActiveAccountCookie } from '@shared/utils/active-account-cookie';
import { ANALYTICS_API_ROUTE } from '../constants/analytics.constants';
import type { AnalyticsData } from '../types/analytics.types';

interface UseAnalyticsDataResult {
	data: AnalyticsData;
	isLoading: boolean;
	switchAccount: (accountId: string) => Promise<void>;
}

/**
 * Client-side state for the Analytics page. Starts from the server-rendered `initialData` (so
 * the first paint needs no extra fetch) and re-fetches from the analytics API route whenever the
 * user switches trading accounts.
 */
export function useAnalyticsData(initialData: AnalyticsData): UseAnalyticsDataResult {
	const [data, setData] = useState(initialData);
	const [isLoading, setIsLoading] = useState(false);

	const switchAccount = useCallback(
		async (accountId: string) => {
			if (accountId === data.activeAccountId) {
				return;
			}

			setIsLoading(true);
			persistActiveAccountCookie(accountId);
			try {
				const response = await fetch(`${ANALYTICS_API_ROUTE}?accountId=${encodeURIComponent(accountId)}`);
				if (!response.ok) {
					throw new Error('Failed to load account.');
				}
				const next = (await response.json()) as AnalyticsData;
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
