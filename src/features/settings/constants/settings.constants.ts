import { ACCOUNT_TYPES, MARKET_TYPES } from '@shared/lib/db/schema/enums';
import type { AccountType, MarketType } from '@shared/types';

export const SETTINGS_PROFILE_API_ROUTE = '/api/settings/profile';
export const SETTINGS_ACCOUNTS_API_ROUTE = '/api/settings/accounts';
export const SETTINGS_STRATEGIES_API_ROUTE = '/api/settings/strategies';
export const SETTINGS_SYMBOLS_API_ROUTE = '/api/settings/symbols';
export const SETTINGS_RISK_API_ROUTE = '/api/settings/risk';

export const SETTINGS_PAGE_ROUTE = '/app/settings';

export const SETTINGS_TABS = ['profile', 'accounts', 'strategies', 'symbols', 'risk', 'sharing'] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number];

export const SETTINGS_TAB_OPTIONS: ReadonlyArray<{ id: SettingsTab; label: string }> = [
	{ id: 'profile', label: 'Profile' },
	{ id: 'accounts', label: 'Accounts' },
	{ id: 'strategies', label: 'Strategies' },
	{ id: 'symbols', label: 'Symbols' },
	{ id: 'risk', label: 'Risk' },
	{ id: 'sharing', label: 'Sharing' },
];

/** Parses `?tab=` from the Settings URL; unknown values fall back to Profile. */
export function parseSettingsTab(value: string | null | undefined): SettingsTab {
	if (value && (SETTINGS_TABS as readonly string[]).includes(value)) {
		return value as SettingsTab;
	}
	return 'profile';
}

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
	{ value: 'UTC', label: 'UTC' },
	{ value: 'Asia/Jakarta', label: 'Asia/Jakarta (WIB)' },
	{ value: 'Asia/Singapore', label: 'Asia/Singapore' },
	{ value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
	{ value: 'Asia/Dubai', label: 'Asia/Dubai' },
	{ value: 'Asia/Kolkata', label: 'Asia/Kolkata' },
	{ value: 'Europe/London', label: 'Europe/London' },
	{ value: 'Europe/Paris', label: 'Europe/Paris' },
	{ value: 'Europe/Berlin', label: 'Europe/Berlin' },
	{ value: 'America/New_York', label: 'America/New_York (ET)' },
	{ value: 'America/Chicago', label: 'America/Chicago (CT)' },
	{ value: 'America/Denver', label: 'America/Denver (MT)' },
	{ value: 'America/Los_Angeles', label: 'America/Los_Angeles (PT)' },
	{ value: 'Australia/Sydney', label: 'Australia/Sydney' },
] as const;
