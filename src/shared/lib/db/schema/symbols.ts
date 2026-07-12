import { boolean, index, integer, numeric, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { baseColumns } from './_base';
import { marketTypeEnum } from './enums';

/**
 * symbols N:1 user (nullable user = system catalog)
 * Instrument definitions used by trades and watchlists.
 */
export const symbols = pgTable(
	'symbols',
	{
		...baseColumns,
		userId: text('user_id').references(() => user.id, { onDelete: 'restrict' }),
		ticker: text('ticker').notNull(),
		name: text('name').notNull(),
		marketType: marketTypeEnum('market_type').notNull().default('forex'),
		baseAsset: text('base_asset'),
		quoteAsset: text('quote_asset'),
		exchange: text('exchange'),
		pipSize: numeric('pip_size', { precision: 18, scale: 10 }),
		contractSize: numeric('contract_size', { precision: 18, scale: 8 }),
		pricePrecision: integer('price_precision').notNull().default(5),
		isActive: boolean('is_active').notNull().default(true),
	},
	(table) => [
		index('symbols_user_id_idx').on(table.userId),
		index('symbols_ticker_idx').on(table.ticker),
		index('symbols_market_type_idx').on(table.marketType),
		uniqueIndex('symbols_user_ticker_uidx').on(table.userId, table.ticker),
		index('symbols_deleted_at_idx').on(table.deletedAt),
	],
);

/**
 * strategies N:1 user
 * Named playbooks / setups linked optionally to trades.
 */
export const strategies = pgTable(
	'strategies',
	{
		...baseColumns,
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'restrict' }),
		name: text('name').notNull(),
		description: text('description'),
		rules: text('rules'),
		color: text('color'),
		isActive: boolean('is_active').notNull().default(true),
	},
	(table) => [
		index('strategies_user_id_idx').on(table.userId),
		uniqueIndex('strategies_user_name_uidx').on(table.userId, table.name),
		index('strategies_deleted_at_idx').on(table.deletedAt),
	],
);
