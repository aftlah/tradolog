import type { TradingAccount } from '@shared/types';

function toDate(value: Date | string | null | undefined): Date {
	if (value instanceof Date) {
		return value;
	}
	if (typeof value === 'string' || typeof value === 'number') {
		return new Date(value);
	}
	return new Date(Number.NaN);
}

function toDateOrNull(value: Date | string | null | undefined): Date | null {
	if (value === null || value === undefined) {
		return null;
	}
	const date = toDate(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Redis JSON round-trips turn `Date` into ISO strings.
 * Revive before calling `.toISOString()` / date APIs on cached account rows.
 */
export function reviveTradingAccount(account: TradingAccount): TradingAccount {
	return {
		...account,
		createdAt: toDate(account.createdAt),
		updatedAt: toDate(account.updatedAt),
		deletedAt: toDateOrNull(account.deletedAt),
	};
}

export function reviveTradingAccounts(accounts: readonly TradingAccount[]): TradingAccount[] {
	return accounts.map(reviveTradingAccount);
}
