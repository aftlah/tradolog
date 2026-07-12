import { boolean, index, integer, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { trades } from './trades';
import { baseColumns } from './_base';
import { reviewGradeEnum } from './enums';

/**
 * trade_images N:1 trades
 * Stores Cloudflare R2 URLs only (no binary blobs).
 */
export const tradeImages = pgTable(
	'trade_images',
	{
		...baseColumns,
		tradeId: uuid('trade_id')
			.notNull()
			.references(() => trades.id, { onDelete: 'restrict' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'restrict' }),
		url: text('url').notNull(),
		storageKey: text('storage_key').notNull(),
		caption: text('caption'),
		mimeType: text('mime_type'),
		sortOrder: integer('sort_order').notNull().default(0),
		isPrimary: boolean('is_primary').notNull().default(false),
	},
	(table) => [
		index('trade_images_trade_id_idx').on(table.tradeId),
		index('trade_images_user_id_idx').on(table.userId),
		index('trade_images_deleted_at_idx').on(table.deletedAt),
	],
);

/**
 * trade_notes N:1 trades
 */
export const tradeNotes = pgTable(
	'trade_notes',
	{
		...baseColumns,
		tradeId: uuid('trade_id')
			.notNull()
			.references(() => trades.id, { onDelete: 'restrict' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'restrict' }),
		title: text('title'),
		body: text('body').notNull(),
		isPinned: boolean('is_pinned').notNull().default(false),
	},
	(table) => [
		index('trade_notes_trade_id_idx').on(table.tradeId),
		index('trade_notes_user_id_idx').on(table.userId),
		index('trade_notes_deleted_at_idx').on(table.deletedAt),
	],
);

/**
 * trade_reviews 1:1 trades
 * Structured post-trade review / psychology grade.
 */
export const tradeReviews = pgTable(
	'trade_reviews',
	{
		...baseColumns,
		tradeId: uuid('trade_id')
			.notNull()
			.references(() => trades.id, { onDelete: 'restrict' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'restrict' }),
		grade: reviewGradeEnum('grade'),
		followedPlan: boolean('followed_plan'),
		emotionalState: text('emotional_state'),
		executionQuality: integer('execution_quality'),
		summary: text('summary'),
		improvements: text('improvements'),
	},
	(table) => [
		uniqueIndex('trade_reviews_trade_id_uidx').on(table.tradeId),
		index('trade_reviews_user_id_idx').on(table.userId),
		index('trade_reviews_deleted_at_idx').on(table.deletedAt),
	],
);
