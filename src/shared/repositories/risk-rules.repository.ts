import { and, eq, isNull } from 'drizzle-orm';
import { getDb } from '@shared/lib/db';
import { riskRules } from '@shared/lib/db/schema';
import type { NewRiskRules, RiskRules } from '@shared/types';

export class RiskRulesRepository {
	async findByUserId(userId: string): Promise<RiskRules | null> {
		const db = getDb();
		const rows = await db
			.select()
			.from(riskRules)
			.where(and(eq(riskRules.userId, userId), isNull(riskRules.deletedAt)))
			.limit(1);
		return rows[0] ?? null;
	}

	async insert(data: NewRiskRules): Promise<RiskRules> {
		const db = getDb();
		const rows = await db.insert(riskRules).values(data).returning();
		const row = rows[0];
		if (!row) {
			throw new Error('Failed to insert risk rules.');
		}
		return row;
	}

	async updateByUserId(userId: string, data: Partial<NewRiskRules>): Promise<RiskRules | null> {
		const db = getDb();
		const rows = await db
			.update(riskRules)
			.set({ ...data, updatedAt: new Date() })
			.where(and(eq(riskRules.userId, userId), isNull(riskRules.deletedAt)))
			.returning();
		return rows[0] ?? null;
	}
}

export const riskRulesRepository = new RiskRulesRepository();
