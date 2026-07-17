import { CalendarDays, ChevronLeft, ChevronRight, ListChecks, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@shared/components';
import { formatCompactSignedNumber, formatSignedCurrency } from '@shared/utils/format';
import { MONTH_LABELS } from '../constants/calendar.constants';
import type { CalendarMonthTotals } from '../types/calendar.types';
import { CalendarSummaryStat } from './CalendarSummaryStat';

interface CalendarHeaderProps {
	year: number;
	month: number;
	monthTotals: CalendarMonthTotals;
	currency: string;
	isLoading?: boolean;
	onPrevMonth: () => void;
	onNextMonth: () => void;
	onToday: () => void;
}

export function CalendarHeader({ year, month, monthTotals, currency, isLoading, onPrevMonth, onNextMonth, onToday }: CalendarHeaderProps) {
	const netTone = monthTotals.profitLoss > 0 ? 'success' : monthTotals.profitLoss < 0 ? 'danger' : 'muted';
	const monthLabel = MONTH_LABELS[month - 1] ?? '—';

	return (
		<div className="glass-card flex min-w-0 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
			<div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
						<CalendarDays className="size-5" aria-hidden="true" />
					</div>
					<div>
						<p className="text-sm font-medium text-muted">Trading Calendar</p>
						<h2 className="text-xl font-semibold tracking-tight text-foreground">
							{monthLabel} {year}
						</h2>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" onClick={onToday} disabled={isLoading}>
						Today
					</Button>
					<div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
						<Button variant="ghost" size="icon" aria-label="Previous month" onClick={onPrevMonth} disabled={isLoading}>
							<ChevronLeft className="size-4" aria-hidden="true" />
						</Button>
						<Button variant="ghost" size="icon" aria-label="Next month" onClick={onNextMonth} disabled={isLoading}>
							<ChevronRight className="size-4" aria-hidden="true" />
						</Button>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
				<CalendarSummaryStat
					label="Net P&L"
					value={formatSignedCurrency(monthTotals.profitLoss, currency)}
					compactValue={formatCompactSignedNumber(monthTotals.profitLoss)}
					tone={netTone}
					icon={monthTotals.profitLoss < 0 ? TrendingDown : TrendingUp}
				/>
				<CalendarSummaryStat label="Trading Days" value={String(monthTotals.tradingDays)} tone="primary" icon={CalendarDays} />
				<CalendarSummaryStat label="Win Days" value={String(monthTotals.winDays)} tone="success" icon={TrendingUp} />
				<CalendarSummaryStat label="Loss Days" value={String(monthTotals.lossDays)} tone="danger" icon={TrendingDown} />
			</div>

			<p className="flex items-center gap-1.5 text-xs text-muted">
				<ListChecks className="size-3.5" aria-hidden="true" />
				{monthTotals.tradeCount} closed trade{monthTotals.tradeCount === 1 ? '' : 's'} this month
			</p>
		</div>
	);
}
