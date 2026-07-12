import { ArrowLeft } from 'lucide-react';
import { getTradeFormDefaults } from '../utils/form-defaults';
import type { TradeDetail, TradeFormOptions } from '../types/trade.types';
import { TradeForm } from './TradeForm';
import { TradePageShell } from './TradePageShell';

interface TradeEditShellProps {
	trade: TradeDetail;
	options: TradeFormOptions;
	userName: string;
	userEmail: string;
}

/** Page-level orchestrator for `/app/trades/[id]/edit`. */
export function TradeEditShell({ trade, options, userName, userEmail }: TradeEditShellProps) {
	return (
		<TradePageShell title="Edit Trade" accounts={options.accounts} activeAccountId={trade.accountId} userName={userName} userEmail={userEmail}>
			<a
				href={`/app/trades/${trade.id}`}
				className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
			>
				<ArrowLeft className="size-4" aria-hidden="true" />
				Back to Trade
			</a>

			<div>
				<h1 className="text-2xl font-semibold tracking-tight text-foreground">
					Edit {trade.symbol} {trade.side === 'long' ? 'Long' : 'Short'}
				</h1>
				<p className="mt-1 text-sm text-muted">Every metric recalculates automatically after saving.</p>
			</div>

			<TradeForm mode="edit" tradeId={trade.id} options={options} defaultValues={getTradeFormDefaults(trade)} />
		</TradePageShell>
	);
}
