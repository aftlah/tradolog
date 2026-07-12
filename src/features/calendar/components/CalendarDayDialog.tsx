import { ArrowDownRight, ArrowUpRight, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@shared/components';
import { formatDate, formatSignedCurrency } from '@shared/utils/format';
import type { CalendarDay, CalendarTradeSummary } from '../types/calendar.types';

interface CalendarDayDialogProps {
	day: CalendarDay | null;
	trades: CalendarTradeSummary[];
	currency: string;
	onOpenChange: (open: boolean) => void;
}

export function CalendarDayDialog({ day, trades, currency, onOpenChange }: CalendarDayDialogProps) {
	return (
		<Dialog open={day !== null} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>
						{day ? formatDate(day.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : ''}
					</DialogTitle>
					<DialogDescription>
						{day ? (
							<>
								{day.tradeCount} trade{day.tradeCount === 1 ? '' : 's'} · Net{' '}
								<span className={day.profitLoss > 0 ? 'text-emerald-300' : day.profitLoss < 0 ? 'text-rose-300' : 'text-slate-300'}>
									{formatSignedCurrency(day.profitLoss, currency)}
								</span>
							</>
						) : null}
					</DialogDescription>
				</DialogHeader>

				<div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
					{trades.map((trade) => (
						<a
							key={trade.id}
							href={`/app/trades/${trade.id}`}
							className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3 transition-colors duration-200 hover:bg-white/[0.06]"
						>
							<span className="flex items-center gap-2 text-sm">
								{trade.side === 'long' ? (
									<ArrowUpRight className="size-4 text-success" aria-hidden="true" />
								) : (
									<ArrowDownRight className="size-4 text-danger" aria-hidden="true" />
								)}
								<span className="font-medium text-foreground">{trade.symbol}</span>
								<span className="capitalize text-muted">{trade.side}</span>
							</span>

							<span className="flex items-center gap-1.5">
								<span
									className={
										trade.profitLoss > 0
											? 'text-sm font-semibold text-emerald-300'
											: trade.profitLoss < 0
												? 'text-sm font-semibold text-rose-300'
												: 'text-sm font-semibold text-slate-300'
									}
								>
									{formatSignedCurrency(trade.profitLoss, currency)}
								</span>
								<ChevronRight className="size-4 text-muted" aria-hidden="true" />
							</span>
						</a>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}
