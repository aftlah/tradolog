import {
	boolean,
	index,
	integer,
	numeric,
	pgTable,
	text,
	uniqueIndex,
	uuid,
} from 'drizzle-orm/pg-core';
import { user } from './auth';
import { symbols } from './symbols';
import { baseColumns } from './_base';
import { goalStatusEnum } from './enums';

/**
 * monthly_goals N:1 user
 * Unique active goal window per user / year / month.
 */
export const monthlyGoals = pgTable(
	'monthly_goals',
	{
		...baseColumns,
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'restrict' }),
		year: integer('year').notNull(),
		month: integer('month').notNull(),
		title: text('title').notNull(),
		description: text('description'),
		targetProfit: numeric('target_profit', { precision: 18, scale: 8 }),
		targetWinRate: numeric('target_win_rate', { precision: 8, scale: 4 }),
		targetTradeCount: integer('target_trade_count'),
		maxDrawdownPercent: numeric('max_drawdown_percent', { precision: 8, scale: 4 }),
		status: goalStatusEnum('status').notNull().default('active'),
	},
	(table) => [
		index('monthly_goals_user_id_idx').on(table.userId),
		uniqueIndex('monthly_goals_user_year_month_uidx').on(table.userId, table.year, table.month),
		index('monthly_goals_status_idx').on(table.status),
		index('monthly_goals_deleted_at_idx').on(table.deletedAt),
	],
);

/**
 * watchlists N:1 user, N:1 symbol
 * Each row is a watched instrument entry for the user.
 */
export const watchlists = pgTable(
	'watchlists',
	{
		...baseColumns,
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'restrict' }),
		symbolId: uuid('symbol_id')
			.notNull()
			.references(() => symbols.id, { onDelete: 'restrict' }),
		listName: text('list_name').notNull().default('Default'),
		notes: text('notes'),
		sortOrder: integer('sort_order').notNull().default(0),
		isPinned: boolean('is_pinned').notNull().default(false),
		alertPrice: numeric('alert_price', { precision: 18, scale: 8 }),
	},
	(table) => [
		index('watchlists_user_id_idx').on(table.userId),
		index('watchlists_symbol_id_idx').on(table.symbolId),
		uniqueIndex('watchlists_user_list_symbol_uidx').on(table.userId, table.listName, table.symbolId),
		index('watchlists_deleted_at_idx').on(table.deletedAt),
	],
);
