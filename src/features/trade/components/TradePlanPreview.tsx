import { useMemo } from 'react';
import type { UseFormWatch } from 'react-hook-form';
import { calculateTradeMetrics } from '@shared/services/trading-calculator/trade-metrics';
import { formatCurrency, formatNumber, formatRiskReward } from '@shared/utils/format';
import { XAUUSD_CONTRACT_SIZE, XAUUSD_TICKER } from '../constants/trade.constants';
import type { TradeFormOptions } from '../types/trade.types';
import type { TradeFormInput } from '../validators/trade-schemas';

interface TradePlanPreviewProps {
	watch: UseFormWatch<TradeFormInput>;
	options: TradeFormOptions;
}

function parseOptionalNumber(value: unknown): number | null {
	if (typeof value !== 'string' || value.trim() === '') {
		return null;
	}
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) ? parsed : null;
}

export function TradePlanPreview({ watch, options }: TradePlanPreviewProps) {
	const accountId = watch('accountId');
	const symbolId = watch('symbolId');
	const side = watch('side');
	const entryPrice = watch('entryPrice');
	const exitPrice = watch('exitPrice');
	const stopLoss = watch('stopLoss');
	const takeProfit = watch('takeProfit');
	const quantity = watch('quantity');
	const fees = watch('fees');

	const account = options.accounts.find((item) => item.id === accountId);
	const symbol = options.symbols.find((item) => item.id === symbolId);

	const preview = useMemo(() => {
		const entry = parseOptionalNumber(entryPrice);
		const qty = parseOptionalNumber(quantity);
		if (!account || !symbol || entry === null || qty === null || qty <= 0 || !side) {
			return null;
		}

		const contractSize = symbol.ticker === XAUUSD_TICKER ? XAUUSD_CONTRACT_SIZE : 1;
		const fxRate = account.quoteToAccountRate !== null && account.quoteToAccountRate > 0 ? account.quoteToAccountRate : 1;

		return calculateTradeMetrics({
			side: side as 'long' | 'short',
			entryPrice: entry,
			exitPrice: parseOptionalNumber(exitPrice) ?? undefined,
			stopLoss: parseOptionalNumber(stopLoss) ?? undefined,
			takeProfit: parseOptionalNumber(takeProfit) ?? undefined,
			quantity: qty,
			fees: parseOptionalNumber(fees) ?? 0,
			pipSize: symbol.pipSize,
			contractSize,
			fxRate,
		});
	}, [account, symbol, side, entryPrice, exitPrice, stopLoss, takeProfit, quantity, fees]);

	if (!preview || !account) {
		return (
			<div className="rounded-2xl border border-dashed border-white/10 bg-white/2 p-4 text-sm text-muted">
				Fill account, symbol, entry, lots, and SL/TP to preview risk &amp; reward in account currency.
			</div>
		);
	}

	const currency = account.currency;
	const fxLabel =
		account.quoteToAccountRate !== null && account.quoteToAccountRate > 1
			? ` · FX ${formatNumber(account.quoteToAccountRate, 0)}`
			: '';

	return (
		<div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
			<div className="mb-3 flex flex-wrap items-center justify-between gap-2">
				<p className="text-sm font-medium text-foreground">Plan Preview</p>
				<p className="text-[11px] text-muted">
					{currency}
					{fxLabel}
					{symbol?.ticker === XAUUSD_TICKER ? ' · contract 100' : ''}
				</p>
			</div>
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<PreviewStat
					label="If SL (Risk)"
					value={preview.riskAmount === null ? '—' : formatCurrency(preview.riskAmount, currency)}
					tone="danger"
				/>
				<PreviewStat
					label="If TP (Reward)"
					value={preview.rewardAmount === null ? '—' : formatCurrency(preview.rewardAmount, currency)}
					tone="success"
				/>
				<PreviewStat label="Planned RR" value={formatRiskReward(preview.plannedRR)} />
				<PreviewStat
					label="P&L if Exit"
					value={preview.profitLoss === null ? '—' : formatCurrency(preview.profitLoss, currency)}
					tone={preview.profitLoss === null ? 'muted' : preview.profitLoss >= 0 ? 'success' : 'danger'}
				/>
			</div>
			{(preview.risk !== null || preview.reward !== null) && symbol?.pipSize ? (
				<p className="mt-3 text-[11px] text-muted">
					Risk distance {preview.risk !== null ? formatNumber(preview.risk, 2) : '—'}
					{preview.risk !== null ? ` (${formatNumber(preview.risk / symbol.pipSize, 1)} pips)` : ''}
					{' · '}
					Reward distance {preview.reward !== null ? formatNumber(preview.reward, 2) : '—'}
					{preview.reward !== null ? ` (${formatNumber(preview.reward / symbol.pipSize, 1)} pips)` : ''}
				</p>
			) : null}
		</div>
	);
}

function PreviewStat({
	label,
	value,
	tone = 'muted',
}: {
	label: string;
	value: string;
	tone?: 'success' | 'danger' | 'muted';
}) {
	const valueClass =
		tone === 'success' ? 'text-emerald-300' : tone === 'danger' ? 'text-rose-300' : 'text-foreground';

	return (
		<div>
			<p className="text-[11px] text-muted">{label}</p>
			<p className={`mt-0.5 text-sm font-semibold tracking-tight ${valueClass}`}>{value}</p>
		</div>
	);
}
