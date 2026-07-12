import { useMemo, useState } from 'react';
import { FeaturePageShell, NoAccountsEmptyState } from '@shared/components';
import { LogoutButton } from '@features/auth';
import { useCalendarData } from '../hooks/useCalendarData';
import type { CalendarData, CalendarDay } from '../types/calendar.types';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { CalendarDayDialog } from './CalendarDayDialog';

interface CalendarShellProps {
	initialData: CalendarData;
	userName: string;
	userEmail: string;
}

/**
 * Top-level Calendar orchestrator. Owns month/account-switching state and the selected-day
 * dialog; every child component is purely presentational and receives already-computed data
 * from `CalendarService` as props. Navigation chrome comes from the shared `FeaturePageShell`.
 */
export function CalendarShell({ initialData, userName, userEmail }: CalendarShellProps) {
	const { data, isLoading, goToPrevMonth, goToNextMonth, goToToday, switchAccount } = useCalendarData(initialData);
	const [selectedDate, setSelectedDate] = useState<string | null>(null);

	const selectedDay = useMemo<CalendarDay | null>(
		() => data.days.find((day) => day.date === selectedDate) ?? null,
		[data.days, selectedDate],
	);

	const selectedDayTrades = useMemo(
		() => (selectedDay ? data.trades.filter((trade) => selectedDay.tradeIds.includes(trade.id)) : []),
		[data.trades, selectedDay],
	);

	return (
		<FeaturePageShell
			title="Calendar"
			activeHref="/app/calendar"
			accounts={data.accounts}
			activeAccountId={data.activeAccountId}
			onAccountChange={switchAccount}
			isLoadingAccount={isLoading}
			userName={userName}
			userEmail={userEmail}
			userMenuFooter={<LogoutButton className="w-full" />}
		>
			{data.accounts.length === 0 ? (
				<NoAccountsEmptyState description="Your trading calendar will light up with green and red days once you add a trading account and start closing trades." />
			) : (
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
			)}
		</FeaturePageShell>
	);
}
