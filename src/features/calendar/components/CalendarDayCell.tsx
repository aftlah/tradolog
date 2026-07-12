import { motion } from 'framer-motion';
import { cn } from '@shared/utils/cn';
import { formatSignedCurrency } from '@shared/utils/format';
import type { CalendarDay } from '../types/calendar.types';

interface CalendarDayCellProps {
	day: CalendarDay;
	dayOfMonth: number;
	currency: string;
	isToday: boolean;
	/** Largest `abs(profitLoss)` across the visible month, used to scale color intensity. */
	maxAbsProfitLoss: number;
	onSelect: () => void;
}

/** Maps a `[0, 1]` intensity + P&L sign to a heat-map background, kept local since it's purely visual. */
function heatMapBackground(profitLoss: number, intensity: number): string | undefined {
	if (profitLoss === 0) {
		return undefined;
	}
	const alpha = 0.12 + intensity * 0.28;
	const rgb = profitLoss > 0 ? '34 197 94' : '239 68 68';
	return `rgb(${rgb} / ${alpha.toFixed(3)})`;
}

/**
 * One day cell in the `CalendarGrid` heat-map. Every number is pre-computed by `CalendarService`
 * — this component only formats and colors them (green profit days, red loss days, muted for no
 * trades) and forwards clicks for days that have trades.
 */
export function CalendarDayCell({ day, dayOfMonth, currency, isToday, maxAbsProfitLoss, onSelect }: CalendarDayCellProps) {
	const hasTrades = day.tradeCount > 0;
	const intensity = maxAbsProfitLoss > 0 ? Math.min(Math.abs(day.profitLoss) / maxAbsProfitLoss, 1) : 0;
	const background = heatMapBackground(day.profitLoss, intensity);

	return (
		<motion.button
			type="button"
			disabled={!hasTrades}
			onClick={onSelect}
			whileHover={hasTrades ? { y: -2 } : undefined}
			transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
			className={cn(
				'flex min-h-24 flex-col items-start gap-1.5 rounded-2xl border p-2.5 text-left transition-colors duration-200 sm:min-h-28',
				hasTrades ? 'cursor-pointer border-white/10 hover:border-white/20' : 'cursor-default border-white/[0.06]',
				isToday && 'ring-1 ring-primary/60',
			)}
			style={{ background: background ?? 'rgb(255 255 255 / 0.02)' }}
		>
			<span className={cn('text-xs font-medium', isToday ? 'text-primary' : 'text-muted')}>{dayOfMonth}</span>

			{hasTrades ? (
				<div className="flex flex-1 flex-col justify-end gap-0.5">
					<span className={cn('text-sm font-semibold tracking-tight', day.profitLoss >= 0 ? 'text-success' : 'text-danger')}>
						{formatSignedCurrency(day.profitLoss, currency)}
					</span>
					<span className="text-[11px] text-muted">
						{day.tradeCount} trade{day.tradeCount === 1 ? '' : 's'}
					</span>
				</div>
			) : null}
		</motion.button>
	);
}
