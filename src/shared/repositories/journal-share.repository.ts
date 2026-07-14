import { and, desc, eq, inArray, isNull, or, sql } from 'drizzle-orm';
import { getDb } from '@shared/lib/db';
import { journalShares, user } from '@shared/lib/db/schema';
import type { JournalShare, NewJournalShare, ShareStatus } from '@shared/types';

export type AuthUserSummary = {
	id: string;
	name: string;
	email: string;
};

export class JournalShareRepository {
	async findById(id: string): Promise<JournalShare | null> {
		const db = getDb();
		const rows = await db
			.select()
			.from(journalShares)
			.where(and(eq(journalShares.id, id), isNull(journalShares.deletedAt)))
			.limit(1);
		return rows[0] ?? null;
	}

	async findByInviteToken(token: string): Promise<JournalShare | null> {
		const db = getDb();
		const rows = await db
			.select()
			.from(journalShares)
			.where(and(eq(journalShares.inviteToken, token), isNull(journalShares.deletedAt)))
			.limit(1);
		return rows[0] ?? null;
	}

	async findActiveForOwnerAndEmail(ownerUserId: string, mentorEmail: string): Promise<JournalShare | null> {
		const db = getDb();
		const rows = await db
			.select()
			.from(journalShares)
			.where(
				and(
					eq(journalShares.ownerUserId, ownerUserId),
					eq(journalShares.mentorEmail, mentorEmail),
					inArray(journalShares.status, ['pending', 'active']),
					isNull(journalShares.deletedAt),
				),
			)
			.limit(1);
		return rows[0] ?? null;
	}

	async listByOwner(ownerUserId: string): Promise<JournalShare[]> {
		const db = getDb();
		return db
			.select()
			.from(journalShares)
			.where(and(eq(journalShares.ownerUserId, ownerUserId), isNull(journalShares.deletedAt)))
			.orderBy(desc(journalShares.createdAt));
	}

	/** Shares where this user is mentor (by user id or matching email) and not revoked. */
	async listForMentor(mentorUserId: string, mentorEmail: string): Promise<JournalShare[]> {
		const db = getDb();
		const normalized = mentorEmail.trim().toLowerCase();
		return db
			.select()
			.from(journalShares)
			.where(
				and(
					isNull(journalShares.deletedAt),
					inArray(journalShares.status, ['pending', 'active']),
					or(eq(journalShares.mentorUserId, mentorUserId), eq(journalShares.mentorEmail, normalized)),
				),
			)
			.orderBy(desc(journalShares.createdAt));
	}

	async insert(data: NewJournalShare): Promise<JournalShare> {
		const db = getDb();
		const rows = await db.insert(journalShares).values(data).returning();
		const row = rows[0];
		if (!row) {
			throw new Error('Failed to insert journal share.');
		}
		return row;
	}

	async updateById(id: string, data: Partial<NewJournalShare> & { status?: ShareStatus }): Promise<JournalShare | null> {
		const db = getDb();
		const rows = await db
			.update(journalShares)
			.set({ ...data, updatedAt: new Date() })
			.where(and(eq(journalShares.id, id), isNull(journalShares.deletedAt)))
			.returning();
		return rows[0] ?? null;
	}

	async softDeleteByIdForOwner(id: string, ownerUserId: string): Promise<boolean> {
		const db = getDb();
		const rows = await db
			.update(journalShares)
			.set({ deletedAt: new Date(), updatedAt: new Date(), status: 'revoked', revokedAt: new Date() })
			.where(
				and(eq(journalShares.id, id), eq(journalShares.ownerUserId, ownerUserId), isNull(journalShares.deletedAt)),
			)
			.returning({ id: journalShares.id });
		return rows.length > 0;
	}

	async findUserByEmail(email: string): Promise<AuthUserSummary | null> {
		const db = getDb();
		const normalized = email.trim().toLowerCase();
		const rows = await db
			.select({ id: user.id, name: user.name, email: user.email })
			.from(user)
			.where(and(sql`lower(${user.email}) = ${normalized}`, isNull(user.deletedAt)))
			.limit(1);
		return rows[0] ?? null;
	}

	async findUserById(userId: string): Promise<AuthUserSummary | null> {
		const db = getDb();
		const rows = await db
			.select({ id: user.id, name: user.name, email: user.email })
			.from(user)
			.where(and(eq(user.id, userId), isNull(user.deletedAt)))
			.limit(1);
		return rows[0] ?? null;
	}
}

export const journalShareRepository = new JournalShareRepository();
