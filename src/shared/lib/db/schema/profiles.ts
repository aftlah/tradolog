import { boolean, index, integer, numeric, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { baseColumns } from './_base';
import { accountTypeEnum } from './enums';

/**
 * profiles 1:1 user
 * Extended trader preferences; auth identity stays on Better Auth `user`.
 */
export const profiles = pgTable(
	'profiles',
	{
		...baseColumns,
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'restrict' }),
		displayName: text('display_name'),
		timezone: text('timezone').notNull().default('UTC'),
		baseCurrency: text('base_currency').notNull().default('USD'),
		riskPerTradePercent: numeric('risk_per_trade_percent', { precision: 8, scale: 4 }),
		defaultRiskReward: numeric('default_risk_reward', { precision: 8, scale: 4 }),
		bio: text('bio'),
		avatarUrl: text('avatar_url'),
		onboardingCompleted: boolean('onboarding_completed').notNull().default(false),
	},
	(table) => [
		uniqueIndex('profiles_user_id_uidx').on(table.userId),
		index('profiles_deleted_at_idx').on(table.deletedAt),
	],
);

/**
 * accounts N:1 user
 * Trading broker/demo/paper accounts (not Better Auth `account`).
 */
export const accounts = pgTable(
	'accounts',
	{
		...baseColumns,
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'restrict' }),
		name: text('name').notNull(),
		broker: text('broker'),
		accountType: accountTypeEnum('account_type').notNull().default('demo'),
		currency: text('currency').notNull().default('USD'),
		startingBalance: numeric('starting_balance', { precision: 18, scale: 8 }).notNull().default('0'),
		currentBalance: numeric('current_balance', { precision: 18, scale: 8 }).notNull().default('0'),
		leverage: integer('leverage'),
		/**
		 * Converts instrument quote P&L (usually USD for XAUUSD) into account currency.
		 * Example: IDR account → `18050` means 1 USD = Rp 18.050. Null/1 = no conversion.
		 */
		quoteToAccountRate: numeric('quote_to_account_rate', { precision: 18, scale: 8 }),
		isDefault: boolean('is_default').notNull().default(false),
		notes: text('notes'),
	},
	(table) => [
		index('accounts_user_id_idx').on(table.userId),
		index('accounts_user_deleted_idx').on(table.userId, table.deletedAt),
		index('accounts_type_idx').on(table.accountType),
	],
);
