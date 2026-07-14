import type { TradeResult, TradeSession, TradeSide, TradeStatus } from '@shared/types';
import type { TradeSortColumn } from '../types/trade.types';

export const TRADES_API_ROUTE = '/api/trades';
export const PARSE_SETUP_API_ROUTE = '/api/trades/parse-setup';

/** Standard XAUUSD lot = 100 oz. Used when the symbol row has no `contractSize` yet. */
export const XAUUSD_TICKER = 'XAUUSD';
export const XAUUSD_CONTRACT_SIZE = 100;

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

/** Default journal order — newest logged trades first. */
export const DEFAULT_TRADE_LIST_SORT: { sortBy: TradeSortColumn; sortDir: 'asc' | 'desc' } = {
	sortBy: 'createdAt',
	sortDir: 'desc',
};

export const MAX_IMAGES_PER_TRADE = 8;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const;

export const SIDE_OPTIONS: Array<{ value: TradeSide; label: string }> = [
	{ value: 'long', label: 'Long' },
	{ value: 'short', label: 'Short' },
];

export const STATUS_OPTIONS: Array<{ value: TradeStatus; label: string }> = [
	{ value: 'planned', label: 'Planned' },
	{ value: 'open', label: 'Open' },
	{ value: 'closed', label: 'Closed' },
	{ value: 'cancelled', label: 'Cancelled' },
];

export const RESULT_OPTIONS: Array<{ value: TradeResult; label: string }> = [
	{ value: 'win', label: 'Win' },
	{ value: 'loss', label: 'Loss' },
	{ value: 'breakeven', label: 'Breakeven' },
];

export const SESSION_OPTIONS: Array<{ value: TradeSession; label: string }> = [
	{ value: 'asian', label: 'Asian' },
	{ value: 'london', label: 'London' },
	{ value: 'new_york', label: 'New York' },
	{ value: 'overlap', label: 'Overlap' },
];

type BadgeVariant = 'success' | 'danger' | 'muted' | 'warning' | 'primary';

export const RESULT_BADGE: Record<TradeResult | 'pending', { label: string; variant: BadgeVariant }> = {
	win: { label: 'Win', variant: 'success' },
	loss: { label: 'Loss', variant: 'danger' },
	breakeven: { label: 'Breakeven', variant: 'muted' },
	pending: { label: 'Open', variant: 'warning' },
};

export const STATUS_BADGE: Record<TradeStatus, { label: string; variant: BadgeVariant }> = {
	planned: { label: 'Planned', variant: 'muted' },
	open: { label: 'Open', variant: 'warning' },
	closed: { label: 'Closed', variant: 'primary' },
	cancelled: { label: 'Cancelled', variant: 'muted' },
};

export const SESSION_LABEL: Record<TradeSession, string> = {
	asian: 'Asian',
	london: 'London',
	new_york: 'New York',
	overlap: 'Overlap',
};

export const SORT_OPTIONS: Array<{ value: string; label: string }> = [
	{ value: 'createdAt', label: 'Date Logged' },
	{ value: 'openedAt', label: 'Date Opened' },
	{ value: 'closedAt', label: 'Date Closed' },
	{ value: 'profitLoss', label: 'P&L' },
	{ value: 'profitLossPercent', label: 'P&L %' },
	{ value: 'actualRr', label: 'RR' },
];
