import { ArrowLeft } from 'lucide-react';
import { getTradeFormDefaults } from '../utils/form-defaults';
import type { TradeFormOptions } from '../types/trade.types';
import { TradeForm } from './TradeForm';

interface TradeCreateShellProps {
	options: TradeFormOptions;
	defaultAccountId: string | null;
	/** Server-rendered ISO timestamp so SSR + client hydration share the same `openedAt` default. */
	nowIso: string;
}

/** Page body for `/app/trades/new`. */
export function TradeCreateShell({ options, defaultAccountId, nowIso }: TradeCreateShellProps) {
	return (
		<>
			<a href="/app/trades" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground">
				<ArrowLeft className="size-4" aria-hidden="true" />
				Back to Trade Journal
			</a>

			<div>
				<h1 className="text-2xl font-semibold tracking-tight text-foreground">Log a New Trade</h1>
				<p className="mt-1 text-sm text-muted">Enter your raw prices and size — every metric is calculated automatically.</p>
			</div>

			<TradeForm mode="create" options={options} defaultValues={getTradeFormDefaults(null, defaultAccountId, nowIso)} />
		</>
	);
}
