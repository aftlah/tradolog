import { useEffect, useMemo, useState } from 'react';
import { NoAccountsEmptyState } from '@shared/components';
import { subscribeClientAccountSwitch } from '@shared/utils/account-switch-events';
import { useCalendarData } from '../hooks/useCalendarData';
import type { CalendarData, CalendarDay } from '../types/calendar.types';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { CalendarDayDialog } from './CalendarDayDialog';

interface CalendarShellProps {
	initialData: CalendarData;
}

/** Calendar page body — chrome lives in the persisted `AppLayout` shell. */
export function CalendarShell({ initialData }: CalendarShellProps) {
	const { data, isLoading, goToPrevMonth, goToNextMonth, goToToday, switchAccount } =
		useCalendarData(initialData);
	const [selectedDate, setSelectedDate] = useState<string | null>(null);

	useEffect(() => subscribeClientAccountSwitch(switchAccount), [switchAccount]);

	const selectedDay = useMemo<CalendarDay | null>(
		() => data.days.find((day) => day.date === selectedDate) ?? null,
		[data.days, selectedDate],
	);

	const selectedDayTrades = useMemo(
		() => (selectedDay ? data.trades.filter((trade) => selectedDay.tradeIds.includes(trade.id)) : []),
		[data.trades, selectedDay],
	);

	if (data.accounts.length === 0) {
		return (
			<NoAccountsEmptyState description="Your trading calendar will light up with green and red days once you add a trading account and start closing trades." />
		);
	}

	return (
		<>
			<CalendarHeader
				year={data.year}
				month={data.month}
				monthTotals={data.monthTotals}
				currency={data.currency}
				isLoading={isLoading}
				onPrevMonth={goToPrevMonth}
				onNextMonth={goToNextMonth}
				onToday={goToToday}
			/>

			<CalendarGrid
				year={data.year}
				month={data.month}
				days={data.days}
				currency={data.currency}
				onSelectDay={(day) => setSelectedDate(day.date)}
			/>

			<CalendarDayDialog
				day={selectedDay}
				trades={selectedDayTrades}
				currency={data.currency}
				onOpenChange={(open) => {
					if (!open) {
						setSelectedDate(null);
					}
				}}
			/>
		</>
	);
}
