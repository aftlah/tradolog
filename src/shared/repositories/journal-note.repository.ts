import { and, desc, eq, isNull } from 'drizzle-orm';
import { getDb } from '@shared/lib/db';
import { journalNotes } from '@shared/lib/db/schema';
import type { JournalNote, NewJournalNote } from '@shared/types';

export class JournalNoteRepository {
	async listByUserId(userId: string): Promise<JournalNote[]> {
		const db = getDb();
		return db
			.select()
			.from(journalNotes)
			.where(and(eq(journalNotes.userId, userId), isNull(journalNotes.deletedAt)))
			.orderBy(desc(journalNotes.isPinned), desc(journalNotes.createdAt));
	}

	async findByIdForUser(id: string, userId: string): Promise<JournalNote | null> {
		const db = getDb();
		const rows = await db
			.select()
			.from(journalNotes)
			.where(and(eq(journalNotes.id, id), eq(journalNotes.userId, userId), isNull(journalNotes.deletedAt)))
			.limit(1);
		return rows[0] ?? null;
	}

	async insert(data: NewJournalNote): Promise<JournalNote> {
		const db = getDb();
		const rows = await db.insert(journalNotes).values(data).returning();
		const row = rows[0];
		if (!row) {
			throw new Error('Failed to insert journal note.');
		}
		return row;
	}

	async updateForUser(id: string, userId: string, data: Partial<NewJournalNote>): Promise<JournalNote | null> {
		const db = getDb();
		const rows = await db
			.update(journalNotes)
			.set({ ...data, updatedAt: new Date() })
			.where(and(eq(journalNotes.id, id), eq(journalNotes.userId, userId), isNull(journalNotes.deletedAt)))
			.returning();
		return rows[0] ?? null;
	}

	async softDeleteForUser(id: string, userId: string): Promise<boolean> {
		const db = getDb();
		const rows = await db
			.update(journalNotes)
			.set({ deletedAt: new Date(), updatedAt: new Date() })
			.where(and(eq(journalNotes.id, id), eq(journalNotes.userId, userId), isNull(journalNotes.deletedAt)))
			.returning({ id: journalNotes.id });
		return rows.length > 0;
	}
}

export const journalNoteRepository = new JournalNoteRepository();
