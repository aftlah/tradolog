import {
	index,
	numeric,
	pgTable,
	text,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core';
import { user } from './auth';
import { accounts } from './profiles';
import { strategies, symbols } from './symbols';
import { baseColumns } from './_base';
import { tradeResultEnum, tradeSessionEnum, tradeSideEnum, tradeStatusEnum } from './enums';

/**
 * trades N:1 user, account, symbol; optional N:1 strategy
 * Soft-delete only — FK deletes are restricted to preserve history.
 */
export const trades = pgTable(
	'trades',
	{
		...baseColumns,
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'restrict' }),
		accountId: uuid('account_id')
			.notNull()
			.references(() => accounts.id, { onDelete: 'restrict' }),
		symbolId: uuid('symbol_id')
			.notNull()
			.references(() => symbols.id, { onDelete: 'restrict' }),
		strategyId: uuid('strategy_id').references(() => strategies.id, { onDelete: 'set null' }),
		side: tradeSideEnum('side').notNull(),
		status: tradeStatusEnum('status').notNull().default('planned'),
		result: tradeResultEnum('result'),
		session: tradeSessionEnum('session'),
		entryPrice: numeric('entry_price', { precision: 18, scale: 8 }),
		exitPrice: numeric('exit_price', { precision: 18, scale: 8 }),
		stopLoss: numeric('stop_loss', { precision: 18, scale: 8 }),
		takeProfit: numeric('take_profit', { precision: 18, scale: 8 }),
		quantity: numeric('quantity', { precision: 18, scale: 8 }),
		riskAmount: numeric('risk_amount', { precision: 18, scale: 8 }),
		rewardAmount: numeric('reward_amount', { precision: 18, scale: 8 }),
		plannedRr: numeric('planned_rr', { precision: 12, scale: 4 }),
		actualRr: numeric('actual_rr', { precision: 12, scale: 4 }),
		profitLoss: numeric('profit_loss', { precision: 18, scale: 8 }),
		profitLossPercent: numeric('profit_loss_percent', { precision: 12, scale: 6 }),
		pips: numeric('pips', { precision: 12, scale: 4 }),
		fees: numeric('fees', { precision: 18, scale: 8 }).default('0'),
		openedAt: timestamp('opened_at', { withTimezone: true, mode: 'date' }),
		closedAt: timestamp('closed_at', { withTimezone: true, mode: 'date' }),
		holdingTimeSeconds: numeric('holding_time_seconds', { precision: 18, scale: 0 }),
		setup: text('setup'),
		mistakes: text('mistakes'),
		lessons: text('lessons'),
		tags: text('tags'),
	},
	(table) => [
		index('trades_user_id_idx').on(table.userId),
		index('trades_account_id_idx').on(table.accountId),
		index('trades_symbol_id_idx').on(table.symbolId),
		index('trades_strategy_id_idx').on(table.strategyId),
		index('trades_status_idx').on(table.status),
		index('trades_opened_at_idx').on(table.openedAt),
		index('trades_user_opened_idx').on(table.userId, table.openedAt),
		index('trades_user_deleted_idx').on(table.userId, table.deletedAt),
		index('trades_account_closed_metrics_idx').on(
			table.userId,
			table.accountId,
			table.status,
			table.deletedAt,
			table.closedAt,
		),
	],
);
