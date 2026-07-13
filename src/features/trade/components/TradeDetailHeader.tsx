import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowDownRight, ArrowLeft, ArrowUpRight, Pencil, Trash2 } from 'lucide-react';
import { Badge, Button, ConfirmDialog } from '@shared/components';
import { formatDateTime } from '@shared/utils/format';
import { softNavigate } from '@shared/utils/soft-navigate';
import { RESULT_BADGE, SESSION_LABEL, TRADES_API_ROUTE } from '../constants/trade.constants';
import type { TradeDetail } from '../types/trade.types';

interface TradeDetailHeaderProps {
	trade: TradeDetail;
}

/** Trade Detail hero: identity, status/result badges, key metadata, and edit/delete actions. */
export function TradeDetailHeader({ trade }: TradeDetailHeaderProps) {
	const [confirmOpen, setConfirmOpen] = useState(false);

	const badge = trade.status === 'closed' ? RESULT_BADGE[trade.result ?? 'pending'] : RESULT_BADGE.pending;
	const statusLabel = trade.status === 'closed' ? badge.label : trade.status.charAt(0).toUpperCase() + trade.status.slice(1);

	async function handleDelete() {
		const response = await fetch(`${TRADES_API_ROUTE}/${trade.id}`, { method: 'DELETE' });
		if (!response.ok) {
			toast.error('Could not delete this trade.');
			return;
		}
		toast.success('Trade deleted.');
		await softNavigate('/app/trades');
	}

	return (
		<div className="glass-card p-6">
			<a href="/app/trades" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground">
				<ArrowLeft className="size-4" aria-hidden="true" />
				Back to Trade Journal
			</a>

			<div className="mt-4 flex flex-wrap items-start justify-between gap-4">
				<div className="flex items-center gap-3">
					<div
						className={
							trade.side === 'long'
								? 'flex size-12 items-center justify-center rounded-2xl bg-success/10 text-success'
								: 'flex size-12 items-center justify-center rounded-2xl bg-danger/10 text-danger'
						}
					>
						{trade.side === 'long' ? (
							<ArrowUpRight className="size-6" aria-hidden="true" />
						) : (
							<ArrowDownRight className="size-6" aria-hidden="true" />
						)}
					</div>
					<div>
						<div className="flex items-center gap-2">
							<h1 className="text-2xl font-semibold tracking-tight text-foreground">{trade.symbol}</h1>
							<Badge variant={badge.variant}>{statusLabel}</Badge>
						</div>
						<p className="mt-1 text-sm text-muted">
							{trade.accountName} · {trade.side === 'long' ? 'Long' : 'Short'}
							{trade.strategy ? ` · ${trade.strategy}` : ''}
							{trade.session ? ` · ${SESSION_LABEL[trade.session]} session` : ''}
						</p>
						<p className="mt-1 text-xs text-muted">
							Opened {trade.openedAt ? formatDateTime(trade.openedAt) : '—'}
							{trade.closedAt ? ` · Closed ${formatDateTime(trade.closedAt)}` : ''}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Button asChild variant="outline" size="sm" className="gap-1.5">
						<a href={`/app/trades/${trade.id}/edit`}>
							<Pencil className="size-4" aria-hidden="true" />
							Edit
						</a>
					</Button>
					<Button variant="outline" size="sm" className="gap-1.5 text-danger hover:text-danger" onClick={() => setConfirmOpen(true)}>
						<Trash2 className="size-4" aria-hidden="true" />
						Delete
					</Button>
				</div>
			</div>

			<ConfirmDialog
				open={confirmOpen}
				onOpenChange={setConfirmOpen}
				title="Delete this trade?"
				description="This removes the trade, its screenshots, and its notes from your journal. This action cannot be undone."
				onConfirm={handleDelete}
			/>
		</div>
	);
}
