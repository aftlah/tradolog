import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { persistActiveAccountCookie } from '@shared/utils/active-account-cookie';
import { CALENDAR_API_ROUTE } from '../constants/calendar.constants';
import { buildCalendarQueryParams } from '../utils/query';
import type { CalendarData } from '../types/calendar.types';

interface UseCalendarDataResult {
	data: CalendarData;
	isLoading: boolean;
	goToPrevMonth: () => void;
	goToNextMonth: () => void;
	goToToday: () => void;
	switchAccount: (accountId: string) => Promise<void>;
}

export function useCalendarData(initialData: CalendarData): UseCalendarDataResult {
	const [data, setData] = useState(initialData);
	const [isLoading, setIsLoading] = useState(false);
	const requestId = useRef(0);

	const fetchCalendar = useCallback(async (year: number, month: number, accountId: string | null) => {
		const currentRequestId = ++requestId.current;
		setIsLoading(true);
		try {
			const params = buildCalendarQueryParams({ year, month, accountId: accountId ?? undefined });
			const response = await fetch(`${CALENDAR_API_ROUTE}?${params.toString()}`);
			if (!response.ok) {
				throw new Error('Failed to load calendar.');
			}
			const next = (await response.json()) as CalendarData;
			if (currentRequestId !== requestId.current) {
				return;
			}
			setData(next);
			window.history.replaceState(null, '', `?${params.toString()}`);
		} catch {
			toast.error('Could not load the calendar. Please try again.');
		} finally {
			if (currentRequestId === requestId.current) {
				setIsLoading(false);
			}
		}
	}, []);

	const goToPrevMonth = useCallback(() => {
		const { year, month, activeAccountId } = data;
		const target = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
		void fetchCalendar(target.year, target.month, activeAccountId);
	}, [data, fetchCalendar]);

	const goToNextMonth = useCallback(() => {
		const { year, month, activeAccountId } = data;
		const target = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
		void fetchCalendar(target.year, target.month, activeAccountId);
	}, [data, fetchCalendar]);

	const goToToday = useCallback(() => {
		const now = new Date();
		void fetchCalendar(now.getUTCFullYear(), now.getUTCMonth() + 1, data.activeAccountId);
	}, [data.activeAccountId, fetchCalendar]);

	const switchAccount = useCallback(
		async (accountId: string) => {
			if (accountId === data.activeAccountId) {
				return;
			}
			persistActiveAccountCookie(accountId);
			await fetchCalendar(data.year, data.month, accountId);
		},
		[data, fetchCalendar],
	);

	return { data, isLoading, goToPrevMonth, goToNextMonth, goToToday, switchAccount };
}
