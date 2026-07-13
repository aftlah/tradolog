import { NoAccountsEmptyState, Pagination } from '@shared/components';
import { useTradeTable } from '../hooks/useTradeTable';
import type { PaginatedResult, TradeFormOptions, TradeListItem, TradeListQuery } from '../types/trade.types';
import { TradeFiltersBar } from './TradeFiltersBar';
import { TradesDataTable } from './TradesDataTable';

interface TradeJournalShellProps {
	initialData: PaginatedResult<TradeListItem>;
	initialQuery: TradeListQuery;
	options: TradeFormOptions;
}

/** Trade Journal page body — chrome lives in the persisted `AppLayout` shell. */
export function TradeJournalShell({ initialData, initialQuery, options }: TradeJournalShellProps) {
	const { data, query, isLoading, setPage, setSort, setFilters, resetFilters, refetch } = useTradeTable({
		initialData,
		initialQuery,
	});

	if (options.accounts.length === 0) {
		return <NoAccountsEmptyState description="Add a trading account first, then come back here to start logging trades." />;
	}

	return (
		<>
			<TradeFiltersBar query={query} options={options} onFiltersChange={setFilters} onReset={resetFilters} />

			<TradesDataTable
				trades={data.items}
				query={query}
				isLoading={isLoading}
				onSort={setSort}
				onTradeDeleted={refetch}
			/>

			<div className="flex items-center justify-between gap-3">
				<p className="text-sm text-muted">
					{data.total === 0 ? 'No trades' : `${data.total} trade${data.total === 1 ? '' : 's'} found`}
				</p>
				<Pagination page={data.page} pageCount={data.pageCount} onPageChange={setPage} disabled={isLoading} />
			</div>
		</>
	);
}
