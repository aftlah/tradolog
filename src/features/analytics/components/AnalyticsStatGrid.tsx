import { Percent, Scale, Target, TrendingDown, TrendingUp, Trophy, Wallet, Zap } from 'lucide-react';
import { formatCurrency, formatPercent, formatProfitFactor, formatRiskReward, formatSignedCurrency } from '@shared/utils/format';
import { AnalyticsMetricCard, type MetricTrend } from './AnalyticsMetricCard';
import type { PerformanceSummary } from '@shared/services';

interface AnalyticsStatGridProps {
	performance: PerformanceSummary;
	currency: string;
}

function trendFor(value: number): MetricTrend {
	if (value > 0) {
		return 'up';
	}
	if (value < 0) {
		return 'down';
	}
	return 'neutral';
}

/** Headline performance metrics for the Analytics page — every value is pre-computed by `TradingCalculatorService`. */
export function AnalyticsStatGrid({ performance, currency }: AnalyticsStatGridProps) {
	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
			<AnalyticsMetricCard
				index={0}
				icon={Percent}
				label="Win Rate"
				value={formatPercent(performance.winRate)}
				subtext={`${performance.wins}W / ${performance.losses}L / ${performance.breakevens}BE`}
				trend={trendFor(performance.winRate - 50)}
			/>
			<AnalyticsMetricCard
				index={1}
				icon={Scale}
				label="Profit Factor"
				value={formatProfitFactor(performance.profitFactor)}
				subtext={`${performance.totalTrades} closed trades`}
				trend={
					performance.profitFactor === null
						? 'neutral'
						: trendFor((performance.profitFactor === Number.POSITIVE_INFINITY ? 2 : performance.profitFactor) - 1)
				}
			/>
			<AnalyticsMetricCard
				index={2}
				icon={Zap}
				label="Expectancy / Trade"
				value={formatSignedCurrency(performance.expectancy, currency)}
				subtext="Average P&L per closed trade"
				trend={trendFor(performance.expectancy)}
			/>
			<AnalyticsMetricCard
				index={3}
				icon={Target}
				label="Avg RR"
				value={formatRiskReward(performance.averageActualRR)}
				subtext={`Planned ${formatRiskReward(performance.averagePlannedRR)}`}
				trend="neutral"
			/>
			<AnalyticsMetricCard
				index={4}
				icon={TrendingUp}
				label="Average Win"
				value={formatCurrency(performance.averageWin, currency)}
				subtext="Mean profit on winning trades"
				trend="up"
			/>
			<AnalyticsMetricCard
				index={5}
				icon={TrendingDown}
				label="Average Loss"
				value={formatCurrency(performance.averageLoss, currency)}
				subtext="Mean loss on losing trades"
				trend="down"
			/>
			<AnalyticsMetricCard
				index={6}
				icon={Trophy}
				label="Largest Win"
				value={formatCurrency(performance.largestWin, currency)}
				subtext="Best single trade"
				trend="up"
			/>
			<AnalyticsMetricCard
				index={7}
				icon={Wallet}
				label="Largest Loss"
				value={formatCurrency(performance.largestLoss, currency)}
				subtext="Worst single trade"
				trend="down"
			/>
		</div>
	);
}
