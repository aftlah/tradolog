import type { ReactNode } from 'react';
import {
	formatCurrency,
	formatHoldingTime,
	formatNumber,
	formatRiskReward,
	formatSignedCurrency,
	formatSignedPercent,
} from '@shared/utils/format';
import { XAUUSD_TICKER } from '../constants/trade.constants';
import type { TradeDetail } from '../types/trade.types';

interface TradeMetricsGridProps {
	trade: TradeDetail;
}

export function TradeMetricsGrid({ trade }: TradeMetricsGridProps) {
	const pl = trade.profitLoss;
	const plClassName = pl === null ? undefined : pl >= 0 ? 'text-emerald-300' : 'text-rose-300';
	const showProfitPerLot = trade.symbol === XAUUSD_TICKER && trade.profitPerLot !== null;
	const fxHint =
		trade.quoteToAccountRate !== null && trade.quoteToAccountRate > 1
			? `Converted with account rate 1 USD = ${formatNumber(trade.quoteToAccountRate, 0)} ${trade.currency}.`
			: undefined;

	return (
		<div className="glass-card p-6">
			<h2 className="mb-4 text-sm font-medium text-muted">Trade Metrics</h2>
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
				<Metric label="Entry Price" value={trade.entryPrice === null ? '—' : formatNumber(trade.entryPrice, 5)} />
				<Metric label="Exit Price" value={trade.exitPrice === null ? '—' : formatNumber(trade.exitPrice, 5)} />
				<Metric label="Stop Loss" value={trade.stopLoss === null ? '—' : formatNumber(trade.stopLoss, 5)} />
				<Metric label="Take Profit" value={trade.takeProfit === null ? '—' : formatNumber(trade.takeProfit, 5)} />
				<Metric
					label={trade.symbol === XAUUSD_TICKER ? 'Lots' : 'Quantity'}
					value={trade.quantity === null ? '—' : formatNumber(trade.quantity, 2)}
				/>
				<Metric label="Fees" value={trade.fees === null ? '—' : formatCurrency(trade.fees, trade.currency)} />

				<Metric
					label="Profit / Loss"
					value={pl === null ? '—' : formatSignedCurrency(pl, trade.currency)}
					valueClassName={plClassName}
					hint={fxHint}
				/>
				{showProfitPerLot && trade.profitPerLot !== null ? (
					<Metric
						label="Profit / Lot"
						value={formatSignedCurrency(trade.profitPerLot, trade.currency)}
						valueClassName={trade.profitPerLot >= 0 ? 'text-emerald-300' : 'text-rose-300'}
					/>
				) : null}
				<Metric
					label="Profit / Loss %"
					value={trade.profitLossPercent === null ? '—' : formatSignedPercent(trade.profitLossPercent)}
					valueClassName={plClassName}
				/>
				<Metric label="Planned RR" value={formatRiskReward(trade.plannedRR)} />
				<Metric label="Actual RR" value={formatRiskReward(trade.actualRR)} />
				<Metric
					label="Risk Amount"
					value={trade.riskAmount === null ? '—' : formatCurrency(trade.riskAmount, trade.currency)}
					hint={fxHint}
				/>
				<Metric
					label="Reward Amount"
					value={trade.rewardAmount === null ? '—' : formatCurrency(trade.rewardAmount, trade.currency)}
					hint={fxHint}
				/>
				<Metric
					label="Pips"
					value={trade.pips === null ? '—' : formatNumber(trade.pips, 1)}
					hint={
						trade.symbol === XAUUSD_TICKER
							? 'Price move ÷ 0.01 (1 pip XAUUSD = $0.01). Positive = favorable.'
							: 'Price move ÷ symbol pip size. Positive = favorable.'
					}
				/>
				<Metric label="Holding Time" value={formatHoldingTime(trade.holdingTimeSeconds)} />
			</div>
		</div>
	);
}

function Metric({
	label,
	value,
	valueClassName,
	hint,
}: {
	label: string;
	value: ReactNode;
	valueClassName?: string;
	hint?: string;
}) {
	return (
		<div className="rounded-2xl border border-white/8 bg-white/3 p-4">
			<p className="text-xs text-muted">{label}</p>
			<p className={`mt-1 text-lg font-semibold tracking-tight text-foreground ${valueClassName ?? ''}`}>{value}</p>
			{hint ? <p className="mt-1.5 text-[11px] leading-snug text-muted">{hint}</p> : null}
		</div>
	);
}
