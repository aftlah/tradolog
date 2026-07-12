import { and, eq, isNull } from 'drizzle-orm';
import { getDb } from '@shared/lib/db';
import { profiles } from '@shared/lib/db/schema';
import type { NewProfile, Profile } from '@shared/types';

export class ProfileRepository {
	async findByUserId(userId: string): Promise<Profile | null> {
		const db = getDb();
		const rows = await db
			.select()
			.from(profiles)
			.where(and(eq(profiles.userId, userId), isNull(profiles.deletedAt)))
			.limit(1);

		return rows[0] ?? null;
	}

	async findById(id: string): Promise<Profile | null> {
		const db = getDb();
		const rows = await db
			.select()
			.from(profiles)
			.where(and(eq(profiles.id, id), isNull(profiles.deletedAt)))
			.limit(1);

		return rows[0] ?? null;
	}

	async insert(data: NewProfile): Promise<Profile> {
		const db = getDb();
		const rows = await db.insert(profiles).values(data).returning();
		const row = rows[0];
		if (!row) {
			throw new Error('Failed to insert profile.');
		}
		return row;
	}

	async updateByUserId(userId: string, data: Partial<NewProfile>): Promise<Profile | null> {
		const db = getDb();
		const rows = await db
			.update(profiles)
			.set({ ...data, updatedAt: new Date() })
			.where(and(eq(profiles.userId, userId), isNull(profiles.deletedAt)))
			.returning();

		return rows[0] ?? null;
	}

	async softDeleteByUserId(userId: string): Promise<boolean> {
		const db = getDb();
		const rows = await db
			.update(profiles)
			.set({ deletedAt: new Date(), updatedAt: new Date() })
			.where(and(eq(profiles.userId, userId), isNull(profiles.deletedAt)))
			.returning({ id: profiles.id });

		return rows.length > 0;
	}
}

export const profileRepository = new ProfileRepository();
