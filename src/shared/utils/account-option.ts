import type { AccountOption, TradingAccount } from '@shared/types';
import { toFiniteNumber } from '@shared/services';

/** Maps a raw `TradingAccount` row into the serializable DTO used by the app-wide account switcher. */
export function toAccountOption(account: TradingAccount): AccountOption {
	return {
		id: account.id,
		name: account.name,
		broker: account.broker,
		accountType: account.accountType,
		currency: account.currency,
		isDefault: account.isDefault,
		startingBalance: toFiniteNumber(account.startingBalance),
		currentBalance: toFiniteNumber(account.currentBalance),
	};
}
