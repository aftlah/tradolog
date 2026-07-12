import type { TradeDirection } from '@shared/services';
import type { AccountOption, TradeResult, TradeSession, TradeStatus } from '@shared/types';

export interface TradeSymbolOption {
	id: string;
	ticker: string;
	name: string;
	pipSize: number | null;
	pricePrecision: number;
}

export interface TradeStrategyOption {
	id: string;
	name: string;
	color: string | null;
}

/** Everything a Create/Edit Trade form needs to populate its select fields. */
export interface TradeFormOptions {
	accounts: AccountOption[];
	symbols: TradeSymbolOption[];
	strategies: TradeStrategyOption[];
}

/** One row in the Trade Journal table. */
export interface TradeListItem {
	id: string;
	accountId: string;
	accountName: string;
	currency: string;
	symbolId: string;
	symbol: string;
	strategyId: string | null;
	strategy: string | null;
	side: TradeDirection;
	status: TradeStatus;
	result: TradeResult | null;
	session: TradeSession | null;
	entryPrice: number | null;
	exitPrice: number | null;
	quantity: number | null;
	profitLoss: number | null;
	profitLossPercent: number | null;
	actualRR: number | null;
	plannedRR: number | null;
	pips: number | null;
	openedAt: string | null;
	closedAt: string | null;
}

export interface PaginatedResult<T> {
	items: T[];
	page: number;
	pageSize: number;
	total: number;
	pageCount: number;
}

export type TradeSortColumn =
	| 'openedAt'
	| 'closedAt'
	| 'profitLoss'
	| 'profitLossPercent'
	| 'actualRr'
	| 'createdAt';

export interface TradeListQuery {
	page: number;
	pageSize: number;
	sortBy: TradeSortColumn;
	sortDir: 'asc' | 'desc';
	search?: string;
	accountId?: string;
	symbolId?: string;
	strategyId?: string;
	side?: TradeDirection;
	status?: TradeStatus;
	result?: TradeResult;
	session?: TradeSession;
	dateFrom?: string;
	dateTo?: string;
}

export interface TradeImageDto {
	id: string;
	url: string;
	caption: string | null;
	isPrimary: boolean;
	sortOrder: number;
	createdAt: string;
}

export interface TradeNoteDto {
	id: string;
	title: string | null;
	body: string;
	isPinned: boolean;
	createdAt: string;
}

/** Full, ready-to-render payload for the Trade Detail page (and the Edit form's defaults). */
export interface TradeDetail extends TradeListItem {
	stopLoss: number | null;
	takeProfit: number | null;
	riskAmount: number | null;
	rewardAmount: number | null;
	fees: number | null;
	holdingTimeSeconds: number | null;
	setup: string | null;
	mistakes: string | null;
	lessons: string | null;
	tags: string | null;
	createdAt: string;
	updatedAt: string;
	images: TradeImageDto[];
	notes: TradeNoteDto[];
}
