import { useMemo } from 'react';
import { WEEKDAY_LABELS } from '../constants/calendar.constants';
import type { CalendarDay } from '../types/calendar.types';
import { CalendarDayCell } from './CalendarDayCell';

interface CalendarGridProps {
	year: number;
	month: number;
	days: CalendarDay[];
	currency: string;
	onSelectDay: (day: CalendarDay) => void;
}

function todayUtcDateKey(): string {
	const now = new Date();
	return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}

/**
 * 7-column week grid for one month. `days` already holds every UTC day of the month with
 * pre-aggregated stats from `CalendarService`; this component only lays them out, pads the
 * leading/trailing blanks so the grid always spans full weeks, and scales heat-map intensity.
 */
export function CalendarGrid({ year, month, days, currency, onSelectDay }: CalendarGridProps) {
	const leadingBlanks = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
	const trailingBlanks = (7 - ((leadingBlanks + days.length) % 7)) % 7;
	const todayKey = useMemo(todayUtcDateKey, []);
	const maxAbsProfitLoss = useMemo(() => Math.max(0, ...days.map((day) => Math.abs(day.profitLoss))), [days]);

	return (
		<div className="glass-card p-4 sm:p-6">
			<div className="mb-3 grid grid-cols-7 gap-2 px-0.5 text-center text-xs font-medium text-muted">
				{WEEKDAY_LABELS.map((label) => (
					<span key={label}>{label}</span>
				))}
			</div>

			<div className="grid grid-cols-7 gap-2">
				{Array.from({ length: leadingBlanks }, (_, index) => (
					<div key={`lead-${index}`} aria-hidden="true" />
				))}

				{days.map((day, index) => (
					<CalendarDayCell
						key={day.date}
						day={day}
						dayOfMonth={index + 1}
						currency={currency}
						isToday={day.date === todayKey}
						maxAbsProfitLoss={maxAbsProfitLoss}
						onSelect={() => onSelectDay(day)}
					/>
				))}

				{Array.from({ length: trailingBlanks }, (_, index) => (
					<div key={`trail-${index}`} aria-hidden="true" />
				))}
			</div>
		</div>
	);
}
