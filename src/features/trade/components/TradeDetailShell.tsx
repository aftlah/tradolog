import { useState } from 'react';
import type { TradeDetail } from '../types/trade.types';
import { TradeDetailHeader } from './TradeDetailHeader';
import { TradeMetricsGrid } from './TradeMetricsGrid';
import { TradeImageGallery } from './TradeImageGallery';
import { TradeNotesPanel } from './TradeNotesPanel';

interface TradeDetailShellProps {
	trade: TradeDetail;
}

/** Page body for `/app/trades/[id]`: metrics, screenshot gallery, and notes. */
export function TradeDetailShell({ trade: initialTrade }: TradeDetailShellProps) {
	const [trade, setTrade] = useState(initialTrade);

	return (
		<>
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
		</>
	);
}
