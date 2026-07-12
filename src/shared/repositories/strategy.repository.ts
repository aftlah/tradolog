import { and, asc, eq, isNull } from 'drizzle-orm';
import { getDb } from '@shared/lib/db';
import { strategies } from '@shared/lib/db/schema';
import type { NewStrategy, Strategy } from '@shared/types';

export class StrategyRepository {
	async listByUserId(userId: string): Promise<Strategy[]> {
		const db = getDb();
		return db
			.select()
			.from(strategies)
			.where(and(eq(strategies.userId, userId), isNull(strategies.deletedAt)))
			.orderBy(asc(strategies.name));
	}

	async findByIdForUser(id: string, userId: string): Promise<Strategy | null> {
		const db = getDb();
		const rows = await db
			.select()
			.from(strategies)
			.where(and(eq(strategies.id, id), eq(strategies.userId, userId), isNull(strategies.deletedAt)))
			.limit(1);

		return rows[0] ?? null;
	}

	async insert(data: NewStrategy): Promise<Strategy> {
		const db = getDb();
		const rows = await db.insert(strategies).values(data).returning();
		const row = rows[0];
		if (!row) {
			throw new Error('Failed to insert strategy.');
		}
		return row;
	}

	async softDeleteForUser(id: string, userId: string): Promise<boolean> {
		const db = getDb();
		const rows = await db
			.update(strategies)
			.set({ deletedAt: new Date(), updatedAt: new Date() })
			.where(and(eq(strategies.id, id), eq(strategies.userId, userId), isNull(strategies.deletedAt)))
			.returning({ id: strategies.id });

		return rows.length > 0;
	}
}

export const strategyRepository = new StrategyRepository();
