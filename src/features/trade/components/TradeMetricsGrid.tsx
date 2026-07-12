import type { ReactNode } from 'react';
import {
	formatCurrency,
	formatHoldingTime,
	formatNumber,
	formatRiskReward,
	formatSignedCurrency,
	formatSignedPercent,
} from '@shared/utils/format';
import type { TradeDetail } from '../types/trade.types';

interface TradeMetricsGridProps {
	trade: TradeDetail;
}

/**
 * Read-only grid of every metric `TradingCalculatorService` derived for this trade. Purely
 * presentational — no calculation happens here, it only formats numbers already computed
 * server-side.
 */
export function TradeMetricsGrid({ trade }: TradeMetricsGridProps) {
	const pl = trade.profitLoss;
	const plClassName = pl === null ? undefined : pl >= 0 ? 'text-success' : 'text-danger';

	return (
		<div className="glass-card p-6">
			<h2 className="mb-4 text-sm font-medium text-muted">Trade Metrics</h2>
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
				<Metric label="Entry Price" value={trade.entryPrice === null ? '—' : formatNumber(trade.entryPrice, 5)} />
				<Metric label="Exit Price" value={trade.exitPrice === null ? '—' : formatNumber(trade.exitPrice, 5)} />
				<Metric label="Stop Loss" value={trade.stopLoss === null ? '—' : formatNumber(trade.stopLoss, 5)} />
				<Metric label="Take Profit" value={trade.takeProfit === null ? '—' : formatNumber(trade.takeProfit, 5)} />
				<Metric label="Quantity" value={trade.quantity === null ? '—' : formatNumber(trade.quantity, 2)} />
				<Metric label="Fees" value={trade.fees === null ? '—' : formatCurrency(trade.fees, trade.currency)} />

				<Metric
					label="Profit / Loss"
					value={pl === null ? '—' : formatSignedCurrency(pl, trade.currency)}
					valueClassName={plClassName}
				/>
				<Metric
					label="Profit / Loss %"
					value={trade.profitLossPercent === null ? '—' : formatSignedPercent(trade.profitLossPercent)}
					valueClassName={plClassName}
				/>
				<Metric label="Planned RR" value={formatRiskReward(trade.plannedRR)} />
				<Metric label="Actual RR" value={formatRiskReward(trade.actualRR)} />
				<Metric label="Risk Amount" value={trade.riskAmount === null ? '—' : formatCurrency(trade.riskAmount, trade.currency)} />
				<Metric label="Reward Amount" value={trade.rewardAmount === null ? '—' : formatCurrency(trade.rewardAmount, trade.currency)} />
				<Metric label="Pips" value={trade.pips === null ? '—' : formatNumber(trade.pips, 1)} />
				<Metric label="Holding Time" value={formatHoldingTime(trade.holdingTimeSeconds)} />
			</div>
		</div>
	);
}

function Metric({ label, value, valueClassName }: { label: string; value: ReactNode; valueClassName?: string }) {
	return (
		<div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
			<p className="text-xs text-muted">{label}</p>
			<p className={`mt-1 text-lg font-semibold tracking-tight text-foreground ${valueClassName ?? ''}`}>{value}</p>
		</div>
	);
}
