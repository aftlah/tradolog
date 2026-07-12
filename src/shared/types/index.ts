export type SoftDeletable = {
	deletedAt: Date | null;
};

export type Timestamps = {
	createdAt: Date;
	updatedAt: Date;
};

export type {
	AccountType,
	MarketType,
	TradeSide,
	TradeStatus,
	TradeResult,
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
	UserScoped,
} from './database';
