import { useState } from 'react';
import { toast } from 'sonner';
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
	Button,
	ConfirmDialog,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@shared/components';
import { TRADES_API_ROUTE } from '../constants/trade.constants';

interface TradeRowActionsProps {
	tradeId: string;
	onDeleted: () => void;
}

/** View/Edit/Delete menu for a single trade row, reused by the Trade Journal table. */
export function TradeRowActions({ tradeId, onDeleted }: TradeRowActionsProps) {
	const [confirmOpen, setConfirmOpen] = useState(false);

	async function handleDelete() {
		const response = await fetch(`${TRADES_API_ROUTE}/${tradeId}`, { method: 'DELETE' });
		if (!response.ok) {
			toast.error('Could not delete trade. Please try again.');
			return;
		}
		toast.success('Trade deleted.');
		onDeleted();
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" aria-label="Trade actions">
						<MoreHorizontal className="size-4" aria-hidden="true" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem asChild>
						<a href={`/app/trades/${tradeId}`}>
							<Eye aria-hidden="true" /> View
						</a>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<a href={`/app/trades/${tradeId}/edit`}>
							<Pencil aria-hidden="true" /> Edit
						</a>
					</DropdownMenuItem>
					<DropdownMenuItem
						variant="destructive"
						onSelect={(event) => {
							event.preventDefault();
							setConfirmOpen(true);
						}}
					>
						<Trash2 aria-hidden="true" /> Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<ConfirmDialog
				open={confirmOpen}
				onOpenChange={setConfirmOpen}
				title="Delete this trade?"
				description="This removes the trade from your journal. This action cannot be undone."
				onConfirm={handleDelete}
			/>
		</>
	);
}
