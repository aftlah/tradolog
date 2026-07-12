import { relations } from 'drizzle-orm';
import { user, session, account, verification } from './auth';
import { profiles, accounts } from './profiles';
import { symbols, strategies } from './symbols';
import { trades } from './trades';
import { tradeImages, tradeNotes, tradeReviews } from './trade-details';
import { monthlyGoals, watchlists } from './goals-watchlists';
import { journalNotes } from './journal-notes';

/** Better Auth: user → sessions / credential accounts / domain graph */
export const userRelations = relations(user, ({ many, one }) => ({
	sessions: many(session),
	authAccounts: many(account),
	profile: one(profiles, {
		fields: [user.id],
		references: [profiles.userId],
	}),
	tradingAccounts: many(accounts),
	symbols: many(symbols),
	strategies: many(strategies),
	trades: many(trades),
	tradeImages: many(tradeImages),
	tradeNotes: many(tradeNotes),
	tradeReviews: many(tradeReviews),
	monthlyGoals: many(monthlyGoals),
	watchlists: many(watchlists),
	journalNotes: many(journalNotes),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const authAccountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

export const profileRelations = relations(profiles, ({ one }) => ({
	user: one(user, {
		fields: [profiles.userId],
		references: [user.id],
	}),
}));

export const tradingAccountRelations = relations(accounts, ({ one, many }) => ({
	user: one(user, {
		fields: [accounts.userId],
		references: [user.id],
	}),
	trades: many(trades),
}));

export const symbolRelations = relations(symbols, ({ one, many }) => ({
	user: one(user, {
		fields: [symbols.userId],
		references: [user.id],
	}),
	trades: many(trades),
	watchlists: many(watchlists),
}));

export const strategyRelations = relations(strategies, ({ one, many }) => ({
	user: one(user, {
		fields: [strategies.userId],
		references: [user.id],
	}),
	trades: many(trades),
}));

export const tradeRelations = relations(trades, ({ one, many }) => ({
	user: one(user, {
		fields: [trades.userId],
		references: [user.id],
	}),
	account: one(accounts, {
		fields: [trades.accountId],
		references: [accounts.id],
	}),
	symbol: one(symbols, {
		fields: [trades.symbolId],
		references: [symbols.id],
	}),
	strategy: one(strategies, {
		fields: [trades.strategyId],
		references: [strategies.id],
	}),
	images: many(tradeImages),
	notes: many(tradeNotes),
	review: one(tradeReviews, {
		fields: [trades.id],
		references: [tradeReviews.tradeId],
	}),
}));

export const tradeImageRelations = relations(tradeImages, ({ one }) => ({
	trade: one(trades, {
		fields: [tradeImages.tradeId],
		references: [trades.id],
	}),
	user: one(user, {
		fields: [tradeImages.userId],
		references: [user.id],
	}),
}));

export const tradeNoteRelations = relations(tradeNotes, ({ one }) => ({
	trade: one(trades, {
		fields: [tradeNotes.tradeId],
		references: [trades.id],
	}),
	user: one(user, {
		fields: [tradeNotes.userId],
		references: [user.id],
	}),
}));

export const tradeReviewRelations = relations(tradeReviews, ({ one }) => ({
	trade: one(trades, {
		fields: [tradeReviews.tradeId],
		references: [trades.id],
	}),
	user: one(user, {
		fields: [tradeReviews.userId],
		references: [user.id],
	}),
}));

export const monthlyGoalRelations = relations(monthlyGoals, ({ one }) => ({
	user: one(user, {
		fields: [monthlyGoals.userId],
		references: [user.id],
	}),
}));

export const watchlistRelations = relations(watchlists, ({ one }) => ({
	user: one(user, {
		fields: [watchlists.userId],
		references: [user.id],
	}),
	symbol: one(symbols, {
		fields: [watchlists.symbolId],
		references: [symbols.id],
	}),
}));

export const journalNoteRelations = relations(journalNotes, ({ one }) => ({
	user: one(user, {
		fields: [journalNotes.userId],
		references: [user.id],
	}),
}));

// Keep verification exported for schema completeness (no graph edges required).
export { verification };
