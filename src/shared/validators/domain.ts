import { z } from 'zod';
import {
	ACCOUNT_TYPES,
	GOAL_STATUSES,
	MARKET_TYPES,
	REVIEW_GRADES,
	TRADE_RESULTS,
	TRADE_SESSIONS,
	TRADE_SIDES,
	TRADE_STATUSES,
} from '@shared/lib/db/schema';

const uuidSchema = z.uuid({ error: 'Invalid UUID.' });
const userIdSchema = z.string().min(1, 'User id is required.');
const numericStringSchema = z
	.string()
	.regex(/^-?\d+(\.\d+)?$/, 'Must be a numeric string.')
	.optional()
	.nullable();

export const accountTypeSchema = z.enum(ACCOUNT_TYPES);
export const marketTypeSchema = z.enum(MARKET_TYPES);
export const tradeSideSchema = z.enum(TRADE_SIDES);
export const tradeStatusSchema = z.enum(TRADE_STATUSES);
export const tradeResultSchema = z.enum(TRADE_RESULTS);
export const tradeSessionSchema = z.enum(TRADE_SESSIONS);
export const reviewGradeSchema = z.enum(REVIEW_GRADES);

export const goalStatusSchema = z.enum(GOAL_STATUSES);

export const profileInsertSchema = z.object({
	userId: userIdSchema,
	displayName: z.string().trim().max(120).optional().nullable(),
	timezone: z.string().trim().min(1).max(64).default('UTC'),
	baseCurrency: z.string().trim().length(3).default('USD'),
	riskPerTradePercent: numericStringSchema,
	defaultRiskReward: numericStringSchema,
	bio: z.string().max(2000).optional().nullable(),
	avatarUrl: z.union([z.url(), z.literal('')]).optional().nullable(),
	onboardingCompleted: z.boolean().default(false),
});

export const profileUpdateSchema = profileInsertSchema.omit({ userId: true }).partial();

export const tradingAccountInsertSchema = z.object({
	userId: userIdSchema,
	name: z.string().trim().min(1).max(120),
	broker: z.string().trim().max(120).optional().nullable(),
	accountType: accountTypeSchema.default('demo'),
	currency: z.string().trim().length(3).default('USD'),
	startingBalance: z.string().regex(/^-?\d+(\.\d+)?$/).default('0'),
	currentBalance: z.string().regex(/^-?\d+(\.\d+)?$/).default('0'),
	leverage: z.number().int().positive().optional().nullable(),
	isDefault: z.boolean().default(false),
	notes: z.string().max(5000).optional().nullable(),
});

export const tradingAccountUpdateSchema = tradingAccountInsertSchema.omit({ userId: true }).partial();

export const symbolInsertSchema = z.object({
	userId: userIdSchema.optional().nullable(),
	ticker: z.string().trim().min(1).max(32),
	name: z.string().trim().min(1).max(120),
	marketType: marketTypeSchema.default('forex'),
	baseAsset: z.string().trim().max(32).optional().nullable(),
	quoteAsset: z.string().trim().max(32).optional().nullable(),
	exchange: z.string().trim().max(64).optional().nullable(),
	pipSize: numericStringSchema,
	contractSize: numericStringSchema,
	pricePrecision: z.number().int().min(0).max(12).default(5),
	isActive: z.boolean().default(true),
});

export const symbolUpdateSchema = symbolInsertSchema.partial();

export const strategyInsertSchema = z.object({
	userId: userIdSchema,
	name: z.string().trim().min(1).max(120),
	description: z.string().max(5000).optional().nullable(),
	rules: z.string().max(10000).optional().nullable(),
	color: z.string().trim().max(32).optional().nullable(),
	isActive: z.boolean().default(true),
});

export const strategyUpdateSchema = strategyInsertSchema.omit({ userId: true }).partial();

export const tradeInsertSchema = z.object({
	userId: userIdSchema,
	accountId: uuidSchema,
	symbolId: uuidSchema,
	strategyId: uuidSchema.optional().nullable(),
	side: tradeSideSchema,
	status: tradeStatusSchema.default('planned'),
	result: tradeResultSchema.optional().nullable(),
	session: tradeSessionSchema.optional().nullable(),
	entryPrice: numericStringSchema,
	exitPrice: numericStringSchema,
	stopLoss: numericStringSchema,
	takeProfit: numericStringSchema,
	quantity: numericStringSchema,
	riskAmount: numericStringSchema,
	rewardAmount: numericStringSchema,
	plannedRr: numericStringSchema,
	actualRr: numericStringSchema,
	profitLoss: numericStringSchema,
	profitLossPercent: numericStringSchema,
	pips: numericStringSchema,
	fees: numericStringSchema,
	openedAt: z.coerce.date().optional().nullable(),
	closedAt: z.coerce.date().optional().nullable(),
	holdingTimeSeconds: numericStringSchema,
	setup: z.string().max(5000).optional().nullable(),
	mistakes: z.string().max(5000).optional().nullable(),
	lessons: z.string().max(5000).optional().nullable(),
	tags: z.string().max(1000).optional().nullable(),
});

export const tradeUpdateSchema = tradeInsertSchema.omit({ userId: true }).partial();

export const tradeImageInsertSchema = z.object({
	tradeId: uuidSchema,
	userId: userIdSchema,
	url: z.url(),
	storageKey: z.string().min(1).max(512),
	caption: z.string().max(500).optional().nullable(),
	mimeType: z.string().max(120).optional().nullable(),
	sortOrder: z.number().int().min(0).default(0),
	isPrimary: z.boolean().default(false),
});

export const tradeNoteInsertSchema = z.object({
	tradeId: uuidSchema,
	userId: userIdSchema,
	title: z.string().max(200).optional().nullable(),
	body: z.string().trim().min(1).max(20000),
	isPinned: z.boolean().default(false),
});

export const tradeReviewInsertSchema = z.object({
	tradeId: uuidSchema,
	userId: userIdSchema,
	grade: reviewGradeSchema.optional().nullable(),
	followedPlan: z.boolean().optional().nullable(),
	emotionalState: z.string().max(120).optional().nullable(),
	executionQuality: z.number().int().min(1).max(10).optional().nullable(),
	summary: z.string().max(5000).optional().nullable(),
	improvements: z.string().max(5000).optional().nullable(),
});

export const monthlyGoalInsertSchema = z.object({
	userId: userIdSchema,
	year: z.number().int().min(2000).max(2100),
	month: z.number().int().min(1).max(12),
	title: z.string().trim().min(1).max(200),
	description: z.string().max(5000).optional().nullable(),
	targetProfit: numericStringSchema,
	targetWinRate: numericStringSchema,
	targetTradeCount: z.number().int().min(0).optional().nullable(),
	maxDrawdownPercent: numericStringSchema,
	status: goalStatusSchema.default('active'),
});

export const watchlistInsertSchema = z.object({
	userId: userIdSchema,
	symbolId: uuidSchema,
	listName: z.string().trim().min(1).max(120).default('Default'),
	notes: z.string().max(2000).optional().nullable(),
	sortOrder: z.number().int().min(0).default(0),
	isPinned: z.boolean().default(false),
	alertPrice: numericStringSchema,
});

export type ProfileInsertInput = z.infer<typeof profileInsertSchema>;
export type TradingAccountInsertInput = z.infer<typeof tradingAccountInsertSchema>;
export type SymbolInsertInput = z.infer<typeof symbolInsertSchema>;
export type StrategyInsertInput = z.infer<typeof strategyInsertSchema>;
export type TradeInsertInput = z.infer<typeof tradeInsertSchema>;
export type TradeImageInsertInput = z.infer<typeof tradeImageInsertSchema>;
export type TradeNoteInsertInput = z.infer<typeof tradeNoteInsertSchema>;
export type TradeReviewInsertInput = z.infer<typeof tradeReviewInsertSchema>;
export type MonthlyGoalInsertInput = z.infer<typeof monthlyGoalInsertSchema>;
export type WatchlistInsertInput = z.infer<typeof watchlistInsertSchema>;
