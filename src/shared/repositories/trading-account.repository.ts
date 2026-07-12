import { and, desc, eq, isNull } from 'drizzle-orm';
import { getDb } from '@shared/lib/db';
import { accounts } from '@shared/lib/db/schema';
import type { NewTradingAccount, TradingAccount } from '@shared/types';

export class TradingAccountRepository {
	async listByUserId(userId: string): Promise<TradingAccount[]> {
		const db = getDb();
		return db
			.select()
			.from(accounts)
			.where(and(eq(accounts.userId, userId), isNull(accounts.deletedAt)))
			.orderBy(desc(accounts.isDefault), desc(accounts.createdAt));
	}

	async findByIdForUser(id: string, userId: string): Promise<TradingAccount | null> {
		const db = getDb();
		const rows = await db
			.select()
			.from(accounts)
			.where(and(eq(accounts.id, id), eq(accounts.userId, userId), isNull(accounts.deletedAt)))
			.limit(1);

		return rows[0] ?? null;
	}

	async insert(data: NewTradingAccount): Promise<TradingAccount> {
		const db = getDb();
		const rows = await db.insert(accounts).values(data).returning();
		const row = rows[0];
		if (!row) {
			throw new Error('Failed to insert trading account.');
		}
		return row;
	}

	async updateForUser(
		id: string,
		userId: string,
		data: Partial<NewTradingAccount>,
	): Promise<TradingAccount | null> {
		const db = getDb();
		const rows = await db
			.update(accounts)
			.set({ ...data, updatedAt: new Date() })
			.where(and(eq(accounts.id, id), eq(accounts.userId, userId), isNull(accounts.deletedAt)))
			.returning();

		return rows[0] ?? null;
	}

	async softDeleteForUser(id: string, userId: string): Promise<boolean> {
		const db = getDb();
		const rows = await db
			.update(accounts)
			.set({ deletedAt: new Date(), updatedAt: new Date() })
			.where(and(eq(accounts.id, id), eq(accounts.userId, userId), isNull(accounts.deletedAt)))
			.returning({ id: accounts.id });

		return rows.length > 0;
	}
}

export const tradingAccountRepository = new TradingAccountRepository();
