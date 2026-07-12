import { and, asc, eq, isNull, or } from 'drizzle-orm';
import { getDb } from '@shared/lib/db';
import { symbols } from '@shared/lib/db/schema';
import type { NewTradeSymbol, TradeSymbol } from '@shared/types';

export class SymbolRepository {
	async listForUser(userId: string): Promise<TradeSymbol[]> {
		const db = getDb();
		return db
			.select()
			.from(symbols)
			.where(
				and(
					isNull(symbols.deletedAt),
					or(eq(symbols.userId, userId), isNull(symbols.userId)),
				),
			)
			.orderBy(asc(symbols.ticker));
	}

	async findById(id: string): Promise<TradeSymbol | null> {
		const db = getDb();
		const rows = await db
			.select()
			.from(symbols)
			.where(and(eq(symbols.id, id), isNull(symbols.deletedAt)))
			.limit(1);

		return rows[0] ?? null;
	}

	async insert(data: NewTradeSymbol): Promise<TradeSymbol> {
		const db = getDb();
		const rows = await db.insert(symbols).values(data).returning();
		const row = rows[0];
		if (!row) {
			throw new Error('Failed to insert symbol.');
		}
		return row;
	}

	async updateForUser(id: string, userId: string, data: Partial<NewTradeSymbol>): Promise<TradeSymbol | null> {
		const db = getDb();
		const rows = await db
			.update(symbols)
			.set({ ...data, updatedAt: new Date() })
			.where(and(eq(symbols.id, id), eq(symbols.userId, userId), isNull(symbols.deletedAt)))
			.returning();
		return rows[0] ?? null;
	}

	async softDeleteForUser(id: string, userId: string): Promise<boolean> {
		const db = getDb();
		const rows = await db
			.update(symbols)
			.set({ deletedAt: new Date(), updatedAt: new Date() })
			.where(and(eq(symbols.id, id), eq(symbols.userId, userId), isNull(symbols.deletedAt)))
			.returning({ id: symbols.id });

		return rows.length > 0;
	}
}

export const symbolRepository = new SymbolRepository();
