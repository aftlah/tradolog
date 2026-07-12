import { and, desc, eq, isNull } from 'drizzle-orm';
import { getDb } from '@shared/lib/db';
import { trades } from '@shared/lib/db/schema';
import type { NewTrade, Trade } from '@shared/types';

export class TradeRepository {
	async listByUserId(userId: string): Promise<Trade[]> {
		const db = getDb();
		return db
			.select()
			.from(trades)
			.where(and(eq(trades.userId, userId), isNull(trades.deletedAt)))
			.orderBy(desc(trades.openedAt), desc(trades.createdAt));
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
