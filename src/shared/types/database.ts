import type {
	accounts,
	journalNotes,
	journalShares,
	monthlyGoals,
	profiles,
	riskRules,
	strategies,
	symbols,
	tradeImages,
	tradeNotes,
	tradeReviews,
	trades,
	watchlists,
} from '@shared/lib/db/schema';
import type {
	ACCOUNT_TYPES,
	GOAL_STATUSES,
	MARKET_TYPES,
	REVIEW_GRADES,
	SHARE_STATUSES,
	TRADE_RESULTS,
	TRADE_SESSIONS,
	TRADE_SIDES,
	TRADE_STATUSES,
} from '@shared/lib/db/schema';

export type AccountType = (typeof ACCOUNT_TYPES)[number];
export type MarketType = (typeof MARKET_TYPES)[number];
export type TradeSide = (typeof TRADE_SIDES)[number];
export type TradeStatus = (typeof TRADE_STATUSES)[number];
export type TradeResult = (typeof TRADE_RESULTS)[number];
export type TradeSession = (typeof TRADE_SESSIONS)[number];
export type ReviewGrade = (typeof REVIEW_GRADES)[number];
export type GoalStatus = (typeof GOAL_STATUSES)[number];
export type ShareStatus = (typeof SHARE_STATUSES)[number];

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type TradingAccount = typeof accounts.$inferSelect;
export type NewTradingAccount = typeof accounts.$inferInsert;
export type TradeSymbol = typeof symbols.$inferSelect;
export type NewTradeSymbol = typeof symbols.$inferInsert;
export type Strategy = typeof strategies.$inferSelect;
export type NewStrategy = typeof strategies.$inferInsert;
export type Trade = typeof trades.$inferSelect;
export type NewTrade = typeof trades.$inferInsert;
export type TradeImage = typeof tradeImages.$inferSelect;
export type NewTradeImage = typeof tradeImages.$inferInsert;
export type TradeNote = typeof tradeNotes.$inferSelect;
export type NewTradeNote = typeof tradeNotes.$inferInsert;
export type TradeReview = typeof tradeReviews.$inferSelect;
export type NewTradeReview = typeof tradeReviews.$inferInsert;
export type MonthlyGoal = typeof monthlyGoals.$inferSelect;
export type NewMonthlyGoal = typeof monthlyGoals.$inferInsert;
export type WatchlistEntry = typeof watchlists.$inferSelect;
export type NewWatchlistEntry = typeof watchlists.$inferInsert;
export type JournalNote = typeof journalNotes.$inferSelect;
export type NewJournalNote = typeof journalNotes.$inferInsert;
export type RiskRules = typeof riskRules.$inferSelect;
export type NewRiskRules = typeof riskRules.$inferInsert;
export type JournalShare = typeof journalShares.$inferSelect;
export type NewJournalShare = typeof journalShares.$inferInsert;

export type SoftDeletable = {
	deletedAt: Date | null;
};

export type Timestamps = {
	createdAt: Date;
	updatedAt: Date;
};

export type UserScoped = {
	userId: string;
};
