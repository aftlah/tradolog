import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { DEFAULT_PAGE_SIZE, DEFAULT_TRADE_LIST_SORT, TRADES_API_ROUTE } from '../constants/trade.constants';
import { buildTradeQueryParams } from '../utils/query';
import type { PaginatedResult, TradeListItem, TradeListQuery } from '../types/trade.types';

interface UseTradeTableOptions {
	initialData: PaginatedResult<TradeListItem>;
	initialQuery: TradeListQuery;
}

interface UseTradeTableResult {
	data: PaginatedResult<TradeListItem>;
	query: TradeListQuery;
	isLoading: boolean;
	setPage: (page: number) => void;
	setSort: (sortBy: TradeListQuery['sortBy'], sortDir: TradeListQuery['sortDir']) => void;
	setFilters: (patch: Partial<Omit<TradeListQuery, 'page' | 'pageSize' | 'sortBy' | 'sortDir'>>) => void;
	setPageSize: (pageSize: number) => void;
	resetFilters: () => void;
	refetch: () => void;
}

const BASE_QUERY: TradeListQuery = {
	page: 1,
	pageSize: DEFAULT_PAGE_SIZE,
	sortBy: DEFAULT_TRADE_LIST_SORT.sortBy,
	sortDir: DEFAULT_TRADE_LIST_SORT.sortDir,
};

/**
 * Owns every piece of Trade Journal table state (filters, search, sort, pagination), keeps the
 * URL in sync (shareable/bookmarkable views), and re-fetches from `/api/trades` on every change
 * — TanStack Table itself stays fully "manual" and purely presentational.
 */
export function useTradeTable({ initialData, initialQuery }: UseTradeTableOptions): UseTradeTableResult {
	const [query, setQuery] = useState<TradeListQuery>(initialQuery);
	const [data, setData] = useState<PaginatedResult<TradeListItem>>(initialData);
	const [isLoading, setIsLoading] = useState(false);
	const isFirstRender = useRef(true);
	const requestId = useRef(0);

	const fetchData = useCallback(async (nextQuery: TradeListQuery) => {
		const currentRequestId = ++requestId.current;
		setIsLoading(true);
		try {
			const params = buildTradeQueryParams(nextQuery);
			const response = await fetch(`${TRADES_API_ROUTE}?${params.toString()}`);
			if (!response.ok) {
				throw new Error('Failed to load trades.');
			}
			const next = (await response.json()) as PaginatedResult<TradeListItem>;
			if (currentRequestId !== requestId.current) {
				return;
			}
			setData(next);
			window.history.replaceState(null, '', `?${params.toString()}`);
		} catch {
			toast.error('Could not load trades. Please try again.');
		} finally {
			if (currentRequestId === requestId.current) {
				setIsLoading(false);
			}
		}
	}, []);

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		void fetchData(query);
	}, [query, fetchData]);

	const setPage = useCallback((page: number) => {
		setQuery((prev) => ({ ...prev, page }));
	}, []);

	const setPageSize = useCallback((pageSize: number) => {
		setQuery((prev) => ({ ...prev, pageSize, page: 1 }));
	}, []);

	const setSort = useCallback((sortBy: TradeListQuery['sortBy'], sortDir: TradeListQuery['sortDir']) => {
		setQuery((prev) => ({ ...prev, sortBy, sortDir, page: 1 }));
	}, []);

	const setFilters = useCallback(
		(patch: Partial<Omit<TradeListQuery, 'page' | 'pageSize' | 'sortBy' | 'sortDir'>>) => {
			setQuery((prev) => ({ ...prev, ...patch, page: 1 }));
		},
		[],
	);

	const resetFilters = useCallback(() => {
		setQuery((prev) => ({ ...BASE_QUERY, pageSize: prev.pageSize, sortBy: prev.sortBy, sortDir: prev.sortDir }));
	}, []);

	const refetch = useCallback(() => {
		void fetchData(query);
	}, [fetchData, query]);

	return { data, query, isLoading, setPage, setSort, setFilters, setPageSize, resetFilters, refetch };
}
