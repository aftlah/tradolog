import { index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { baseColumns } from './_base';
import { shareStatusEnum } from './enums';

/**
 * journal_shares — mentor mode grants.
 * Owner invites a mentor by email; pending until mentor accepts. Active = read-only journal access.
 */
export const journalShares = pgTable(
	'journal_shares',
	{
		...baseColumns,
		ownerUserId: text('owner_user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'restrict' }),
		/** Set when a registered mentor accepts (or is linked). Null while purely email-pending. */
		mentorUserId: text('mentor_user_id').references(() => user.id, { onDelete: 'restrict' }),
		mentorEmail: text('mentor_email').notNull(),
		inviteToken: text('invite_token').notNull(),
		status: shareStatusEnum('status').notNull().default('pending'),
		/** Optional note from owner (“Focus on risk discipline this month”). */
		message: text('message'),
		acceptedAt: timestamp('accepted_at', { withTimezone: true, mode: 'date' }),
		revokedAt: timestamp('revoked_at', { withTimezone: true, mode: 'date' }),
	},
	(table) => [
		uniqueIndex('journal_shares_invite_token_uidx').on(table.inviteToken),
		index('journal_shares_owner_user_id_idx').on(table.ownerUserId),
		index('journal_shares_mentor_user_id_idx').on(table.mentorUserId),
		index('journal_shares_mentor_email_idx').on(table.mentorEmail),
		index('journal_shares_status_idx').on(table.status),
		index('journal_shares_deleted_at_idx').on(table.deletedAt),
	],
);
