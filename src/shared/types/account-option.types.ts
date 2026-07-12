import type { AccountType } from './database';

/** Serializable trading-account summary used by the app-wide account switcher. */
export interface AccountOption {
	id: string;
	name: string;
	broker: string | null;
	accountType: AccountType;
	currency: string;
	isDefault: boolean;
	startingBalance: number;
	currentBalance: number;
	/** Quote→account FX (e.g. USDIDR). `null` means 1 (no conversion). */
	quoteToAccountRate: number | null;
}
