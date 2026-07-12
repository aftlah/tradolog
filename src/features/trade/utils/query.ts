/**
 * Single source of truth for turning a `URLSearchParams` into a validated `TradeListQuery` and
 * back again. Used by the API route, the SSR Astro page, and the client-side table hook so the
 * three never drift out of sync on param names or defaults.
 */
import { DEFAULT_PAGE_SIZE } from '../constants/trade.constants';
import type { TradeListQuery, TradeSortColumn } from '../types/trade.types';

const SORT_COLUMNS: readonly TradeSortColumn[] = [
	'openedAt',
	'closedAt',
	'profitLoss',
	'profitLossPercent',
	'actualRr',
	'createdAt',
];

function toSortColumn(value: string | null): TradeSortColumn {
	return SORT_COLUMNS.includes(value as TradeSortColumn) ? (value as TradeSortColumn) : 'openedAt';
}

function toPositiveInt(value: string | null, fallback: number, max?: number): number {
	const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
	if (!Number.isFinite(parsed) || parsed <= 0) {
		return fallback;
	}
	return max ? Math.min(parsed, max) : parsed;
}

export function parseTradeListQuery(params: URLSearchParams): TradeListQuery {
	return {
		page: toPositiveInt(params.get('page'), 1),
		pageSize: toPositiveInt(params.get('pageSize'), DEFAULT_PAGE_SIZE, 100),
		sortBy: toSortColumn(params.get('sortBy')),
		sortDir: params.get('sortDir') === 'asc' ? 'asc' : 'desc',
		search: params.get('search') ?? undefined,
		accountId: params.get('accountId') ?? undefined,
		symbolId: params.get('symbolId') ?? undefined,
		strategyId: params.get('strategyId') ?? undefined,
		side: (params.get('side') as TradeListQuery['side']) ?? undefined,
		status: (params.get('status') as TradeListQuery['status']) ?? undefined,
		result: (params.get('result') as TradeListQuery['result']) ?? undefined,
		session: (params.get('session') as TradeListQuery['session']) ?? undefined,
		dateFrom: params.get('dateFrom') ?? undefined,
		dateTo: params.get('dateTo') ?? undefined,
	};
}

export function buildTradeQueryParams(query: TradeListQuery): URLSearchParams {
	const params = new URLSearchParams();
	params.set('page', String(query.page));
	params.set('pageSize', String(query.pageSize));
	params.set('sortBy', query.sortBy);
	params.set('sortDir', query.sortDir);

	if (query.search) params.set('search', query.search);
	if (query.accountId) params.set('accountId', query.accountId);
	if (query.symbolId) params.set('symbolId', query.symbolId);
	if (query.strategyId) params.set('strategyId', query.strategyId);
	if (query.side) params.set('side', query.side);
	if (query.status) params.set('status', query.status);
	if (query.result) params.set('result', query.result);
	if (query.session) params.set('session', query.session);
	if (query.dateFrom) params.set('dateFrom', query.dateFrom);
	if (query.dateTo) params.set('dateTo', query.dateTo);

	return params;
}
