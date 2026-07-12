import { useState } from 'react';
import type { AccountOption } from '@shared/types';
import type { TradeDetail } from '../types/trade.types';
import { TradeDetailHeader } from './TradeDetailHeader';
import { TradeMetricsGrid } from './TradeMetricsGrid';
import { TradeImageGallery } from './TradeImageGallery';
import { TradeNotesPanel } from './TradeNotesPanel';
import { TradePageShell } from './TradePageShell';

interface TradeDetailShellProps {
	trade: TradeDetail;
	accounts: AccountOption[];
	userName: string;
	userEmail: string;
}

/** Page-level orchestrator for `/app/trades/[id]`: metrics, screenshot gallery, and notes. */
export function TradeDetailShell({ trade: initialTrade, accounts, userName, userEmail }: TradeDetailShellProps) {
	const [trade, setTrade] = useState(initialTrade);

	return (
		<TradePageShell title="Trade Detail" accounts={accounts} activeAccountId={trade.accountId} userName={userName} userEmail={userEmail}>
			<TradeDetailHeader trade={trade} />
			<TradeMetricsGrid trade={trade} />

			<div className="grid gap-6 lg:grid-cols-2">
				<TradeImageGallery
					tradeId={trade.id}
					images={trade.images}
					onImagesChange={(images) => setTrade((prev) => ({ ...prev, images }))}
				/>
				<TradeNotesPanel
					tradeId={trade.id}
					notes={trade.notes}
					onNotesChange={(notes) => setTrade((prev) => ({ ...prev, notes }))}
				/>
			</div>
		</TradePageShell>
	);
}
