import type { CSSProperties } from 'react';
import { cn } from '@shared/utils/cn';
import { formatSignedCurrency } from '@shared/utils/format';
import type { CalendarDay } from '../types/calendar.types';

interface CalendarDayCellProps {
	day: CalendarDay;
	dayOfMonth: number;
	currency: string;
	isToday: boolean;
	maxAbsProfitLoss: number;
	onSelect: () => void;
}

type DayTone = 'win' | 'loss' | 'flat';

function dayTone(profitLoss: number): DayTone {
	if (profitLoss > 0) {
		return 'win';
	}
	if (profitLoss < 0) {
		return 'loss';
	}
	return 'flat';
}

function heatMapStyle(tone: DayTone, intensity: number): CSSProperties | undefined {
	if (tone === 'flat') {
		return undefined;
	}

	const rgb = tone === 'win' ? '52 211 153' : '251 113 133';
	const wash = 0.1 + intensity * 0.18;
	const edge = 0.22 + intensity * 0.28;
	const glow = 0.06 + intensity * 0.12;

	return {
		background: `linear-gradient(165deg, rgb(${rgb} / ${(wash + 0.08).toFixed(3)}) 0%, rgb(${rgb} / ${(wash * 0.45).toFixed(3)}) 55%, rgb(15 23 42 / 0.35) 100%)`,
		borderColor: `rgb(${rgb} / ${edge.toFixed(3)})`,
		boxShadow: `inset 0 1px 0 rgb(${rgb} / 0.22), 0 0 28px rgb(${rgb} / ${glow.toFixed(3)})`,
	};
}

export function CalendarDayCell({ day, dayOfMonth, currency, isToday, maxAbsProfitLoss, onSelect }: CalendarDayCellProps) {
	const hasTrades = day.tradeCount > 0;
	const tone = dayTone(day.profitLoss);
	const intensity = maxAbsProfitLoss > 0 ? Math.min(Math.abs(day.profitLoss) / maxAbsProfitLoss, 1) : 0;
	const heatStyle = heatMapStyle(tone, intensity);

	return (
		<button
			type="button"
			disabled={!hasTrades}
			onClick={onSelect}
			className={cn(
				'flex min-h-24 flex-col items-start gap-1.5 rounded-2xl border p-2.5 text-left transition-[border-color,box-shadow,transform] duration-200 sm:min-h-28',
				hasTrades && 'cursor-pointer hover:-translate-y-0.5 hover:brightness-110',
				!hasTrades && 'cursor-default border-white/[0.06]',
				!heatStyle && hasTrades && 'border-white/10 hover:border-white/20',
				!heatStyle && !hasTrades && 'border-white/[0.06]',
				isToday && 'ring-1 ring-primary/60',
			)}
			style={{
				background: heatStyle?.background ?? 'rgb(255 255 255 / 0.02)',
				borderColor: heatStyle?.borderColor,
				boxShadow: heatStyle?.boxShadow,
			}}
		>
			<span className={cn('text-xs font-medium', isToday ? 'text-primary' : 'text-muted')}>{dayOfMonth}</span>

			{hasTrades ? (
				<div className="flex flex-1 flex-col justify-end gap-0.5">
					<span
						className={cn(
							'text-sm font-semibold tracking-tight',
							tone === 'win' && 'text-emerald-300',
							tone === 'loss' && 'text-rose-300',
							tone === 'flat' && 'text-slate-300',
						)}
					>
						{formatSignedCurrency(day.profitLoss, currency)}
					</span>
					<span className="text-[11px] text-muted">
						{day.tradeCount} trade{day.tradeCount === 1 ? '' : 's'}
					</span>
				</div>
			) : null}
		</button>
	);
}
