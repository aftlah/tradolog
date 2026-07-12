export type SoftDeletable = {
	deletedAt: Date | null;
};

export type Timestamps = {
	createdAt: Date;
	updatedAt: Date;
};

export type { NavItem } from './nav.types';
export type { AccountOption } from './account-option.types';

export type {
	AccountType,
	MarketType,
	TradeSide,
	TradeStatus,
	TradeResult,
	TradeSession,
	ReviewGrade,
	GoalStatus,
	Profile,
	NewProfile,
	TradingAccount,
	NewTradingAccount,
	TradeSymbol,
	NewTradeSymbol,
	Strategy,
	NewStrategy,
	Trade,
	NewTrade,
	TradeImage,
	NewTradeImage,
	TradeNote,
	NewTradeNote,
	TradeReview,
	NewTradeReview,
	MonthlyGoal,
	NewMonthlyGoal,
	WatchlistEntry,
	NewWatchlistEntry,
	JournalNote,
	NewJournalNote,
	UserScoped,
} from './database';
