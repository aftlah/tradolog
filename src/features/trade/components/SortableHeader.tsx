import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { TradeListQuery, TradeSortColumn } from '../types/trade.types';

interface SortableHeaderProps {
	label: string;
	column: TradeSortColumn;
	query: TradeListQuery;
	onSort: (sortBy: TradeSortColumn, sortDir: TradeListQuery['sortDir']) => void;
}

/** Clickable table header that toggles sort direction for `column`, used by `TradesDataTable`. */
export function SortableHeader({ label, column, query, onSort }: SortableHeaderProps) {
	const isActive = query.sortBy === column;

	function handleClick() {
		if (!isActive) {
			onSort(column, 'desc');
			return;
		}
		onSort(column, query.sortDir === 'desc' ? 'asc' : 'desc');
	}

	const Icon = !isActive ? ArrowUpDown : query.sortDir === 'desc' ? ArrowDown : ArrowUp;

	return (
		<button
			type="button"
			onClick={handleClick}
			className="inline-flex items-center gap-1 text-xs font-medium tracking-wide text-muted uppercase transition-colors hover:text-foreground"
		>
			{label}
			<Icon className={isActive ? 'size-3.5 text-primary' : 'size-3.5 text-muted/60'} aria-hidden="true" />
		</button>
	);
}
