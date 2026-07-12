import { Percent, PiggyBank, Scale, Wallet } from 'lucide-react';
import { formatCurrency, formatPercent, formatProfitFactor, formatSignedCurrency, formatSignedPercent } from '@shared/utils/format';
import { StatCard, type StatTrend } from './StatCard';
import type { DashboardData } from '../types/dashboard.types';

interface StatCardsGridProps {
	data: DashboardData;
}

function trendFor(value: number): StatTrend {
	if (value > 0) {
		return 'up';
	}
	if (value < 0) {
		return 'down';
	}
	return 'neutral';
}

/** Renders the headline Statistic Cards. All values are pre-computed by `TradingCalculatorService`. */
export function StatCardsGrid({ data }: StatCardsGridProps) {
	const netPnl = data.currentBalance - data.startingBalance;
	const netPnlPercent = data.startingBalance > 0 ? (netPnl / data.startingBalance) * 100 : 0;
	const { performance } = data;

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<StatCard
				index={0}
				icon={Wallet}
				label="Account Balance"
				value={formatCurrency(data.currentBalance, data.currency)}
				subtext={`Starting ${formatCurrency(data.startingBalance, data.currency)}`}
				trend="neutral"
			/>
			<StatCard
				index={1}
				icon={PiggyBank}
				label="Net P&L"
				value={formatSignedCurrency(netPnl, data.currency)}
				subtext={`${formatSignedPercent(netPnlPercent)} all-time`}
				trend={trendFor(netPnl)}
			/>
			<StatCard
				index={2}
				icon={Percent}
				label="Win Rate"
				value={formatPercent(performance.winRate)}
				subtext={`${performance.wins}W / ${performance.losses}L / ${performance.breakevens}BE`}
				trend={trendFor(performance.winRate - 50)}
			/>
			<StatCard
				index={3}
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
		</div>
	);
}
