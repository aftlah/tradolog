import { and, asc, count, desc, eq, gte, ilike, isNull, lt, lte, or, sum, type SQL } from 'drizzle-orm';
import { getDb } from '@shared/lib/db';
import { accounts, strategies, symbols, trades } from '@shared/lib/db/schema';
import type { NewTrade, Trade, TradeResult, TradeSession, TradeSide, TradeStatus } from '@shared/types';

/** Calculator-ready closed trade columns only. */
export interface TradeClosedMetrics {
	id: string;
	profitLoss: string | null;
	closedAt: Date | null;
	plannedRr: string | null;
	actualRr: string | null;
	holdingTimeSeconds: string | null;
}

/** Journal table row — excludes setup/mistakes/lessons/tags blobs. */
export interface TradeListSelect {
	id: string;
	accountId: string;
	symbolId: string;
	strategyId: string | null;
	side: TradeSide;
	status: TradeStatus;
	result: TradeResult | null;
	session: TradeSession | null;
	entryPrice: string | null;
	exitPrice: string | null;
	quantity: string | null;
	profitLoss: string | null;
	profitLossPercent: string | null;
	actualRr: string | null;
	plannedRr: string | null;
	pips: string | null;
	openedAt: Date | null;
	closedAt: Date | null;
}

export interface TradeListRow {
	trade: TradeListSelect;
	symbolTicker: string | null;
	strategyName: string | null;
	accountName: string | null;
	accountCurrency: string | null;
}

/** Dashboard recent-trades row. */
export interface TradeRecentSummary {
	id: string;
	side: TradeSide;
	status: TradeStatus;
	result: TradeResult | null;
	profitLoss: string | null;
	profitLossPercent: string | null;
	actualRr: string | null;
	openedAt: Date | null;
	closedAt: Date | null;
	createdAt: Date;
	symbolTicker: string | null;
	strategyName: string | null;
}

/** Calendar day trade chip. */
export interface TradeCalendarSummary {
	id: string;
	side: TradeSide;
	profitLoss: string | null;
	closedAt: Date | null;
	symbolTicker: string | null;
}

const SORTABLE_COLUMNS = {
	openedAt: trades.openedAt,
	closedAt: trades.closedAt,
	profitLoss: trades.profitLoss,
	profitLossPercent: trades.profitLossPercent,
	actualRr: trades.actualRr,
	createdAt: trades.createdAt,
} as const;

export type TradeSortColumn = keyof typeof SORTABLE_COLUMNS;

export interface TradeListFilters {
	accountId?: string;
	symbolId?: string;
	strategyId?: string;
	side?: TradeSide;
	status?: TradeStatus;
	result?: TradeResult;
	session?: TradeSession;
	search?: string;
	dateFrom?: Date;
	dateTo?: Date;
}

export interface TradeListQuery extends TradeListFilters {
	page: number;
	pageSize: number;
	sortBy: TradeSortColumn;
	sortDir: 'asc' | 'desc';
}

function buildWhereClause(userId: string, filters: TradeListFilters): SQL {
	const conditions = [eq(trades.userId, userId), isNull(trades.deletedAt)];

	if (filters.accountId) conditions.push(eq(trades.accountId, filters.accountId));
	if (filters.symbolId) conditions.push(eq(trades.symbolId, filters.symbolId));
	if (filters.strategyId) conditions.push(eq(trades.strategyId, filters.strategyId));
	if (filters.side) conditions.push(eq(trades.side, filters.side));
	if (filters.status) conditions.push(eq(trades.status, filters.status));
	if (filters.result) conditions.push(eq(trades.result, filters.result));
	if (filters.session) conditions.push(eq(trades.session, filters.session));
	if (filters.dateFrom) conditions.push(gte(trades.openedAt, filters.dateFrom));
	if (filters.dateTo) conditions.push(lte(trades.openedAt, filters.dateTo));

	if (filters.search && filters.search.trim().length > 0) {
		const term = `%${filters.search.trim()}%`;
		const searchClause = or(
			ilike(symbols.ticker, term),
			ilike(strategies.name, term),
			ilike(trades.tags, term),
		);
		if (searchClause) conditions.push(searchClause);
	}

	return and(...conditions) as SQL;
}

export class TradeRepository {
	async listByUserId(userId: string): Promise<Trade[]> {
		const db = getDb();
		return db
			.select()
			.from(trades)
			.where(and(eq(trades.userId, userId), isNull(trades.deletedAt)))
			.orderBy(desc(trades.openedAt), desc(trades.createdAt));
	}

	/** Trades for one account only — prefer this over `listByUserId` + filter. */
	async listByAccountId(userId: string, accountId: string): Promise<Trade[]> {
		const db = getDb();
		return db
			.select()
			.from(trades)
			.where(
				and(
					eq(trades.userId, userId),
					eq(trades.accountId, accountId),
					isNull(trades.deletedAt),
				),
			)
			.orderBy(desc(trades.openedAt), desc(trades.createdAt));
	}

	/**
	 * Slim closed-trade rows for calculators — skips notes/prices/setup text.
	 * Newest-first with a hard cap so Neon payload stays bounded on serverless.
	 * Callers should reverse for chronological equity/drawdown when needed.
	 */
	async listClosedMetricsByAccount(
		userId: string,
		accountId: string,
		limit = 2_000,
	): Promise<TradeClosedMetrics[]> {
		const db = getDb();
		const rows = await db
			.select({
				id: trades.id,
				profitLoss: trades.profitLoss,
				closedAt: trades.closedAt,
				plannedRr: trades.plannedRr,
				actualRr: trades.actualRr,
				holdingTimeSeconds: trades.holdingTimeSeconds,
			})
			.from(trades)
			.where(
				and(
					eq(trades.userId, userId),
					eq(trades.accountId, accountId),
					eq(trades.status, 'closed'),
					isNull(trades.deletedAt),
				),
			)
			.orderBy(desc(trades.closedAt), desc(trades.createdAt))
			.limit(limit);

		// Chronological (oldest → newest) for calculator equity/drawdown.
		return rows.reverse();
	}

	/** Recent trades for dashboard table — limited rows with symbol/strategy labels. */
	async listRecentSummariesByAccount(
		userId: string,
		accountId: string,
		limit: number,
	): Promise<TradeRecentSummary[]> {
		const db = getDb();
		return db
			.select({
				id: trades.id,
				side: trades.side,
				status: trades.status,
				result: trades.result,
				profitLoss: trades.profitLoss,
				profitLossPercent: trades.profitLossPercent,
				actualRr: trades.actualRr,
				openedAt: trades.openedAt,
				closedAt: trades.closedAt,
				createdAt: trades.createdAt,
				symbolTicker: symbols.ticker,
				strategyName: strategies.name,
			})
			.from(trades)
			.leftJoin(symbols, eq(trades.symbolId, symbols.id))
			.leftJoin(strategies, eq(trades.strategyId, strategies.id))
			.where(
				and(
					eq(trades.userId, userId),
					eq(trades.accountId, accountId),
					isNull(trades.deletedAt),
				),
			)
			.orderBy(desc(trades.closedAt), desc(trades.openedAt), desc(trades.createdAt))
			.limit(limit);
	}

	/** Closed trades in a closedAt range — used by calendar month views. */
	async listClosedSummariesInRange(
		userId: string,
		accountId: string,
		rangeStart: Date,
		rangeEnd: Date,
	): Promise<TradeCalendarSummary[]> {
		const db = getDb();
		return db
			.select({
				id: trades.id,
				side: trades.side,
				profitLoss: trades.profitLoss,
				closedAt: trades.closedAt,
				symbolTicker: symbols.ticker,
			})
			.from(trades)
			.leftJoin(symbols, eq(trades.symbolId, symbols.id))
			.where(
				and(
					eq(trades.userId, userId),
					eq(trades.accountId, accountId),
					eq(trades.status, 'closed'),
					isNull(trades.deletedAt),
					gte(trades.closedAt, rangeStart),
					lt(trades.closedAt, rangeEnd),
				),
			)
			.orderBy(desc(trades.closedAt));
	}

	/** SQL SUM of closed P&L for one account (no row materialization). */
	async sumClosedProfitLoss(userId: string, accountId: string): Promise<number> {
		const db = getDb();
		const rows = await db
			.select({ total: sum(trades.profitLoss) })
			.from(trades)
			.where(
				and(
					eq(trades.userId, userId),
					eq(trades.accountId, accountId),
					eq(trades.status, 'closed'),
					isNull(trades.deletedAt),
				),
			);
		const total = Number(rows[0]?.total ?? 0);
		return Number.isFinite(total) ? total : 0;
	}

	/** Closed P&L totals grouped by account — one query for all accounts. */
	async sumClosedProfitLossByAccount(userId: string): Promise<Map<string, number>> {
		const db = getDb();
		const rows = await db
			.select({
				accountId: trades.accountId,
				total: sum(trades.profitLoss),
			})
			.from(trades)
			.where(and(eq(trades.userId, userId), eq(trades.status, 'closed'), isNull(trades.deletedAt)))
			.groupBy(trades.accountId);

		const map = new Map<string, number>();
		for (const row of rows) {
			const total = Number(row.total ?? 0);
			map.set(row.accountId, Number.isFinite(total) ? total : 0);
		}
		return map;
	}

	/** Paginated, filtered, sorted, searchable trade list — powers the Trade Journal table. */
	async listPaginated(userId: string, query: TradeListQuery): Promise<{ rows: TradeListRow[]; total: number }> {
		const db = getDb();
		const where = buildWhereClause(userId, query);
		const orderFn = query.sortDir === 'asc' ? asc : desc;
		const sortColumn = SORTABLE_COLUMNS[query.sortBy];
		const offset = (query.page - 1) * query.pageSize;

		const joinedFrom = db
			.select({
				trade: {
					id: trades.id,
					accountId: trades.accountId,
					symbolId: trades.symbolId,
					strategyId: trades.strategyId,
					side: trades.side,
					status: trades.status,
					result: trades.result,
					session: trades.session,
					entryPrice: trades.entryPrice,
					exitPrice: trades.exitPrice,
					quantity: trades.quantity,
					profitLoss: trades.profitLoss,
					profitLossPercent: trades.profitLossPercent,
					actualRr: trades.actualRr,
					plannedRr: trades.plannedRr,
					pips: trades.pips,
					openedAt: trades.openedAt,
					closedAt: trades.closedAt,
				},
				symbolTicker: symbols.ticker,
				strategyName: strategies.name,
				accountName: accounts.name,
				accountCurrency: accounts.currency,
			})
			.from(trades)
			.leftJoin(symbols, eq(trades.symbolId, symbols.id))
			.leftJoin(strategies, eq(trades.strategyId, strategies.id))
			.leftJoin(accounts, eq(trades.accountId, accounts.id));

		const [rows, totalRows] = await Promise.all([
			joinedFrom
				.where(where)
				.orderBy(orderFn(sortColumn), orderFn(trades.createdAt), desc(trades.id))
				.limit(query.pageSize)
				.offset(offset),
			db
				.select({ total: count() })
				.from(trades)
				.leftJoin(symbols, eq(trades.symbolId, symbols.id))
				.leftJoin(strategies, eq(trades.strategyId, strategies.id))
				.where(where),
		]);

		return { rows, total: Number(totalRows[0]?.total ?? 0) };
	}

	async findByIdForUser(id: string, userId: string): Promise<Trade | null> {
		const db = getDb();
		const rows = await db
			.select()
			.from(trades)
			.where(and(eq(trades.id, id), eq(trades.userId, userId), isNull(trades.deletedAt)))
			.limit(1);

		return rows[0] ?? null;
	}

	async insert(data: NewTrade): Promise<Trade> {
		const db = getDb();
		const rows = await db.insert(trades).values(data).returning();
		const row = rows[0];
		if (!row) {
			throw new Error('Failed to insert trade.');
		}
		return row;
	}

	async updateForUser(id: string, userId: string, data: Partial<NewTrade>): Promise<Trade | null> {
		const db = getDb();
		const rows = await db
			.update(trades)
			.set({ ...data, updatedAt: new Date() })
			.where(and(eq(trades.id, id), eq(trades.userId, userId), isNull(trades.deletedAt)))
			.returning();

		return rows[0] ?? null;
	}

	async softDeleteForUser(id: string, userId: string): Promise<boolean> {
		const db = getDb();
		const rows = await db
			.update(trades)
			.set({ deletedAt: new Date(), updatedAt: new Date() })
			.where(and(eq(trades.id, id), eq(trades.userId, userId), isNull(trades.deletedAt)))
			.returning({ id: trades.id });

		return rows.length > 0;
	}
}

export const tradeRepository = new TradeRepository();
