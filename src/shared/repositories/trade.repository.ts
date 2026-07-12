import { and, asc, count, desc, eq, gte, ilike, isNull, lte, or, type SQL } from 'drizzle-orm';
import { getDb } from '@shared/lib/db';
import { accounts, strategies, symbols, trades } from '@shared/lib/db/schema';
import type { NewTrade, Trade, TradeResult, TradeSession, TradeSide, TradeStatus } from '@shared/types';

export interface TradeListRow {
	trade: Trade;
	symbolTicker: string | null;
	strategyName: string | null;
	accountName: string | null;
	accountCurrency: string | null;
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
			ilike(trades.setup, term),
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

	/** Paginated, filtered, sorted, searchable trade list — powers the Trade Journal table. */
	async listPaginated(userId: string, query: TradeListQuery): Promise<{ rows: TradeListRow[]; total: number }> {
		const db = getDb();
		const where = buildWhereClause(userId, query);
		const orderFn = query.sortDir === 'asc' ? asc : desc;
		const sortColumn = SORTABLE_COLUMNS[query.sortBy];
		const offset = (query.page - 1) * query.pageSize;

		const joinedFrom = db
			.select({
				trade: trades,
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
				.orderBy(orderFn(sortColumn), desc(trades.id))
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
