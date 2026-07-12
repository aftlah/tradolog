import { ACCOUNT_TYPES, MARKET_TYPES } from '@shared/lib/db/schema';
import type { AccountType, MarketType } from '@shared/types';

export const SETTINGS_PROFILE_API_ROUTE = '/api/settings/profile';
export const SETTINGS_ACCOUNTS_API_ROUTE = '/api/settings/accounts';
export const SETTINGS_STRATEGIES_API_ROUTE = '/api/settings/strategies';
export const SETTINGS_SYMBOLS_API_ROUTE = '/api/settings/symbols';

const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
	demo: 'Demo',
	live: 'Live',
	paper: 'Paper',
};

export const ACCOUNT_TYPE_OPTIONS: Array<{ value: AccountType; label: string }> = ACCOUNT_TYPES.map((value) => ({
	value,
	label: ACCOUNT_TYPE_LABEL[value],
}));

const MARKET_TYPE_LABEL: Record<MarketType, string> = {
	forex: 'Forex',
	crypto: 'Crypto',
	stocks: 'Stocks',
	futures: 'Futures',
	indices: 'Indices',
	options: 'Options',
	other: 'Other',
};

export const MARKET_TYPE_OPTIONS: Array<{ value: MarketType; label: string }> = MARKET_TYPES.map((value) => ({
	value,
	label: MARKET_TYPE_LABEL[value],
}));

export const STRATEGY_COLOR_SWATCHES = [
	'#2563EB',
	'#22C55E',
	'#EF4444',
	'#F59E0B',
	'#A855F7',
	'#06B6D4',
	'#EC4899',
	'#84CC16',
] as const;

export const TIMEZONE_OPTIONS = [
	'UTC',
	'America/New_York',
	'America/Chicago',
	'America/Denver',
	'America/Los_Angeles',
	'Europe/London',
	'Europe/Paris',
	'Europe/Berlin',
	'Asia/Dubai',
	'Asia/Kolkata',
	'Asia/Singapore',
	'Asia/Tokyo',
	'Asia/Jakarta',
	'Australia/Sydney',
] as const;
