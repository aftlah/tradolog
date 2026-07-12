import { AppShell, NoAccountsEmptyState, Pagination } from '@shared/components';
import { LogoutButton } from '@features/auth/components/LogoutButton';
import { useTradeTable } from '../hooks/useTradeTable';
import type { PaginatedResult, TradeFormOptions, TradeListItem, TradeListQuery } from '../types/trade.types';
import { TradeFiltersBar } from './TradeFiltersBar';
import { TradesDataTable } from './TradesDataTable';

interface TradeJournalShellProps {
	initialData: PaginatedResult<TradeListItem>;
	initialQuery: TradeListQuery;
	options: TradeFormOptions;
	userName: string;
	userEmail: string;
}

/**
 * Top-level Trade Journal orchestrator: owns filter/sort/pagination state via `useTradeTable`
 * and renders the shared `AppShell` chrome plus the filters bar, data table, and pagination —
 * every child stays presentational.
 */
export function TradeJournalShell({ initialData, initialQuery, options, userName, userEmail }: TradeJournalShellProps) {
	const { data, query, isLoading, setPage, setSort, setFilters, resetFilters, refetch } = useTradeTable({
		initialData,
		initialQuery,
	});

	return (
		<AppShell
			title="Trade Journal"
			activeHref="/app/trades"
			userName={userName}
			userEmail={userEmail}
			accounts={options.accounts}
			activeAccountId={query.accountId ?? null}
			onAccountChange={(accountId) => setFilters({ accountId })}
			isLoadingAccount={isLoading}
			showQuickAdd={false}
			userMenuFooter={<LogoutButton className="w-full" />}
		>
			{options.accounts.length === 0 ? (
				<NoAccountsEmptyState description="Add a trading account first, then come back here to start logging trades." />
			) : (
				<>
					<TradeFiltersBar
						query={query}
						options={options}
						onFiltersChange={setFilters}
						onReset={resetFilters}
					/>

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
			)}
		</AppShell>
	);
}
