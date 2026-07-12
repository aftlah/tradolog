import { and, asc, eq, isNull } from 'drizzle-orm';
import { getDb } from '@shared/lib/db';
import { tradeImages, tradeNotes, tradeReviews } from '@shared/lib/db/schema';
import type {
	NewTradeImage,
	NewTradeNote,
	NewTradeReview,
	TradeImage,
	TradeNote,
	TradeReview,
} from '@shared/types';

export class TradeImageRepository {
	async listByTradeId(tradeId: string, userId: string): Promise<TradeImage[]> {
		const db = getDb();
		return db
			.select()
			.from(tradeImages)
			.where(
				and(
					eq(tradeImages.tradeId, tradeId),
					eq(tradeImages.userId, userId),
					isNull(tradeImages.deletedAt),
				),
			)
			.orderBy(asc(tradeImages.sortOrder));
	}

	async insert(data: NewTradeImage): Promise<TradeImage> {
		const db = getDb();
		const rows = await db.insert(tradeImages).values(data).returning();
		const row = rows[0];
		if (!row) {
			throw new Error('Failed to insert trade image.');
		}
		return row;
	}

	async softDeleteForUser(id: string, userId: string): Promise<boolean> {
		const db = getDb();
		const rows = await db
			.update(tradeImages)
			.set({ deletedAt: new Date(), updatedAt: new Date() })
			.where(and(eq(tradeImages.id, id), eq(tradeImages.userId, userId), isNull(tradeImages.deletedAt)))
			.returning({ id: tradeImages.id });

		return rows.length > 0;
	}
}

export class TradeNoteRepository {
	async listByTradeId(tradeId: string, userId: string): Promise<TradeNote[]> {
		const db = getDb();
		return db
			.select()
			.from(tradeNotes)
			.where(
				and(eq(tradeNotes.tradeId, tradeId), eq(tradeNotes.userId, userId), isNull(tradeNotes.deletedAt)),
			)
			.orderBy(asc(tradeNotes.createdAt));
	}

	async insert(data: NewTradeNote): Promise<TradeNote> {
		const db = getDb();
		const rows = await db.insert(tradeNotes).values(data).returning();
		const row = rows[0];
		if (!row) {
			throw new Error('Failed to insert trade note.');
		}
		return row;
	}

	async softDeleteForUser(id: string, userId: string): Promise<boolean> {
		const db = getDb();
		const rows = await db
			.update(tradeNotes)
			.set({ deletedAt: new Date(), updatedAt: new Date() })
			.where(and(eq(tradeNotes.id, id), eq(tradeNotes.userId, userId), isNull(tradeNotes.deletedAt)))
			.returning({ id: tradeNotes.id });

		return rows.length > 0;
	}
}

export class TradeReviewRepository {
	async findByTradeId(tradeId: string, userId: string): Promise<TradeReview | null> {
		const db = getDb();
		const rows = await db
			.select()
			.from(tradeReviews)
			.where(
				and(
					eq(tradeReviews.tradeId, tradeId),
					eq(tradeReviews.userId, userId),
					isNull(tradeReviews.deletedAt),
				),
			)
			.limit(1);

		return rows[0] ?? null;
	}

	async insert(data: NewTradeReview): Promise<TradeReview> {
		const db = getDb();
		const rows = await db.insert(tradeReviews).values(data).returning();
		const row = rows[0];
		if (!row) {
			throw new Error('Failed to insert trade review.');
		}
		return row;
	}

	async softDeleteForUser(id: string, userId: string): Promise<boolean> {
		const db = getDb();
		const rows = await db
			.update(tradeReviews)
			.set({ deletedAt: new Date(), updatedAt: new Date() })
			.where(
				and(eq(tradeReviews.id, id), eq(tradeReviews.userId, userId), isNull(tradeReviews.deletedAt)),
			)
			.returning({ id: tradeReviews.id });

		return rows.length > 0;
	}
}

export const tradeImageRepository = new TradeImageRepository();
export const tradeNoteRepository = new TradeNoteRepository();
export const tradeReviewRepository = new TradeReviewRepository();
