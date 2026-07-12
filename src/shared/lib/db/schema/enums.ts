import { pgEnum } from 'drizzle-orm/pg-core';

export const accountTypeEnum = pgEnum('account_type', ['live', 'demo', 'paper']);

export const marketTypeEnum = pgEnum('market_type', [
	'forex',
	'crypto',
	'stocks',
	'futures',
	'indices',
	'options',
	'other',
]);

export const tradeSideEnum = pgEnum('trade_side', ['long', 'short']);

export const tradeStatusEnum = pgEnum('trade_status', [
	'planned',
	'open',
	'closed',
	'cancelled',
]);

export const tradeResultEnum = pgEnum('trade_result', ['win', 'loss', 'breakeven']);

export const reviewGradeEnum = pgEnum('review_grade', ['A', 'B', 'C', 'D', 'F']);

export const goalStatusEnum = pgEnum('goal_status', ['active', 'completed', 'missed', 'cancelled']);

export const ACCOUNT_TYPES = accountTypeEnum.enumValues;
export const MARKET_TYPES = marketTypeEnum.enumValues;
export const TRADE_SIDES = tradeSideEnum.enumValues;
export const TRADE_STATUSES = tradeStatusEnum.enumValues;
export const TRADE_RESULTS = tradeResultEnum.enumValues;
export const REVIEW_GRADES = reviewGradeEnum.enumValues;
export const GOAL_STATUSES = goalStatusEnum.enumValues;
