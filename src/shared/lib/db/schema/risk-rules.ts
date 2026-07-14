import { boolean, index, integer, numeric, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { baseColumns } from './_base';

/**
 * risk_rules 1:1 user
 * Standing risk constraints (daily/weekly loss, trade count, loss streak) — separate from monthly goals.
 */
export const riskRules = pgTable(
	'risk_rules',
	{
		...baseColumns,
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'restrict' }),
		enabled: boolean('enabled').notNull().default(true),
		/** Absolute daily loss limit in account currency (positive number = max allowed loss). */
		maxDailyLossAmount: numeric('max_daily_loss_amount', { precision: 18, scale: 8 }),
		/** Daily loss as % of starting balance. */
		maxDailyLossPercent: numeric('max_daily_loss_percent', { precision: 8, scale: 4 }),
		maxWeeklyLossAmount: numeric('max_weekly_loss_amount', { precision: 18, scale: 8 }),
		maxWeeklyLossPercent: numeric('max_weekly_loss_percent', { precision: 8, scale: 4 }),
		maxTradesPerDay: integer('max_trades_per_day'),
		maxConsecutiveLosses: integer('max_consecutive_losses'),
	},
	(table) => [
		uniqueIndex('risk_rules_user_id_uidx').on(table.userId),
		index('risk_rules_deleted_at_idx').on(table.deletedAt),
	],
);
