import { and, asc, desc, eq, isNull } from 'drizzle-orm';
import { getDb } from '@shared/lib/db';
import { monthlyGoals, watchlists } from '@shared/lib/db/schema';
import type { MonthlyGoal, NewMonthlyGoal, NewWatchlistEntry, WatchlistEntry } from '@shared/types';

export class MonthlyGoalRepository {
	async listByUserId(userId: string): Promise<MonthlyGoal[]> {
		const db = getDb();
		return db
			.select()
			.from(monthlyGoals)
			.where(and(eq(monthlyGoals.userId, userId), isNull(monthlyGoals.deletedAt)))
			.orderBy(desc(monthlyGoals.year), desc(monthlyGoals.month));
	}

	async findByPeriod(userId: string, year: number, month: number): Promise<MonthlyGoal | null> {
		const db = getDb();
		const rows = await db
			.select()
			.from(monthlyGoals)
			.where(
				and(
					eq(monthlyGoals.userId, userId),
					eq(monthlyGoals.year, year),
					eq(monthlyGoals.month, month),
					isNull(monthlyGoals.deletedAt),
				),
			)
			.limit(1);

		return rows[0] ?? null;
	}

	async insert(data: NewMonthlyGoal): Promise<MonthlyGoal> {
		const db = getDb();
		const rows = await db.insert(monthlyGoals).values(data).returning();
		const row = rows[0];
		if (!row) {
			throw new Error('Failed to insert monthly goal.');
		}
		return row;
	}

	async updateForUser(
		id: string,
		userId: string,
		data: Partial<NewMonthlyGoal>,
	): Promise<MonthlyGoal | null> {
		const db = getDb();
		const rows = await db
			.update(monthlyGoals)
			.set({ ...data, updatedAt: new Date() })
			.where(
				and(eq(monthlyGoals.id, id), eq(monthlyGoals.userId, userId), isNull(monthlyGoals.deletedAt)),
			)
			.returning();

		return rows[0] ?? null;
	}

	async softDeleteForUser(id: string, userId: string): Promise<boolean> {
		const db = getDb();
		const rows = await db
			.update(monthlyGoals)
			.set({ deletedAt: new Date(), updatedAt: new Date() })
			.where(
				and(eq(monthlyGoals.id, id), eq(monthlyGoals.userId, userId), isNull(monthlyGoals.deletedAt)),
			)
			.returning({ id: monthlyGoals.id });

		return rows.length > 0;
	}
}

export class WatchlistRepository {
	async listByUserId(userId: string): Promise<WatchlistEntry[]> {
		const db = getDb();
		return db
			.select()
			.from(watchlists)
			.where(and(eq(watchlists.userId, userId), isNull(watchlists.deletedAt)))
			.orderBy(desc(watchlists.isPinned), asc(watchlists.sortOrder), asc(watchlists.listName));
	}

	async insert(data: NewWatchlistEntry): Promise<WatchlistEntry> {
		const db = getDb();
		const rows = await db.insert(watchlists).values(data).returning();
		const row = rows[0];
		if (!row) {
			throw new Error('Failed to insert watchlist entry.');
		}
		return row;
	}

	async softDeleteForUser(id: string, userId: string): Promise<boolean> {
		const db = getDb();
		const rows = await db
			.update(watchlists)
			.set({ deletedAt: new Date(), updatedAt: new Date() })
			.where(and(eq(watchlists.id, id), eq(watchlists.userId, userId), isNull(watchlists.deletedAt)))
			.returning({ id: watchlists.id });

		return rows.length > 0;
	}
}

export const monthlyGoalRepository = new MonthlyGoalRepository();
export const watchlistRepository = new WatchlistRepository();
