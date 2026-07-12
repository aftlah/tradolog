import { Activity } from 'lucide-react';
import {
	formatCurrency,
	formatProfitFactor,
	formatRiskReward,
	formatSignedCurrency,
} from '@shared/utils/format';
import type { PerformanceSummary, StreakSummary } from '@shared/services';

interface PerformanceSummaryCardProps {
	performance: PerformanceSummary;
	streaks: StreakSummary;
	/** Currency amount of the largest peak-to-trough drawdown (see `TradingCalculatorService.drawdown`). */
	maxDrawdown: number;
	currency: string;
}

interface MetricRowProps {
	label: string;
	value: string;
	valueClassName?: string;
}

function MetricRow({ label, value, valueClassName }: MetricRowProps) {
	return (
		<div className="flex items-center justify-between border-b border-white/5 py-2.5 last:border-0">
			<span className="text-sm text-muted">{label}</span>
			<span className={valueClassName ?? 'text-sm font-medium text-foreground'}>{value}</span>
		</div>
	);
}

/** Secondary performance metrics — all sourced from `TradingCalculatorService`. */
export function PerformanceSummaryCard({ performance, streaks, maxDrawdown, currency }: PerformanceSummaryCardProps) {
	return (
		<div className="glass-card flex h-full flex-col gap-2 p-6">
			<div className="mb-2 flex items-center justify-between">
				<div>
					<h2 className="text-sm font-medium text-muted">Performance Summary</h2>
					<p className="text-lg font-semibold tracking-tight text-foreground">Edge breakdown</p>
				</div>
				<div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
					<Activity className="size-4.5" aria-hidden="true" />
				</div>
			</div>

			<MetricRow label="Expectancy / trade" value={formatSignedCurrency(performance.expectancy, currency)} />
			<MetricRow
				label="Average Win"
				value={formatCurrency(performance.averageWin, currency)}
				valueClassName="text-sm font-medium text-success"
			/>
			<MetricRow
				label="Average Loss"
				value={formatCurrency(performance.averageLoss, currency)}
				valueClassName="text-sm font-medium text-danger"
			/>
			<MetricRow
				label="Largest Win"
				value={formatCurrency(performance.largestWin, currency)}
				valueClassName="text-sm font-medium text-success"
			/>
			<MetricRow
				label="Largest Loss"
				value={formatCurrency(performance.largestLoss, currency)}
				valueClassName="text-sm font-medium text-danger"
			/>
			<MetricRow label="Avg Planned RR" value={formatRiskReward(performance.averagePlannedRR)} />
			<MetricRow label="Avg Actual RR" value={formatRiskReward(performance.averageActualRR)} />
			<MetricRow
				label="Current Streak"
				value={
					streaks.currentWinStreak > 0
						? `${streaks.currentWinStreak}W`
						: streaks.currentLossStreak > 0
							? `${streaks.currentLossStreak}L`
							: '—'
				}
			/>
			<MetricRow label="Max Win / Loss Streak" value={`${streaks.maxWinStreak}W / ${streaks.maxLossStreak}L`} />
			<MetricRow label="Max Drawdown" value={formatCurrency(maxDrawdown, currency)} />
			<MetricRow label="Profit Factor" value={formatProfitFactor(performance.profitFactor)} />
		</div>
	);
}
