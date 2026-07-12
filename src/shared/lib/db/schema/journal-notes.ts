import { boolean, index, pgTable, text } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { baseColumns } from './_base';

/**
 * journal_notes N:1 user
 * Standalone psychology / trading journal entries (not tied to a single trade).
 * Trade-scoped notes live in `trade_notes`.
 */
export const journalNotes = pgTable(
	'journal_notes',
	{
		...baseColumns,
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'restrict' }),
		title: text('title'),
		body: text('body').notNull(),
		tags: text('tags'),
		isPinned: boolean('is_pinned').notNull().default(false),
	},
	(table) => [
		index('journal_notes_user_id_idx').on(table.userId),
		index('journal_notes_user_pinned_idx').on(table.userId, table.isPinned),
		index('journal_notes_deleted_at_idx').on(table.deletedAt),
	],
);
