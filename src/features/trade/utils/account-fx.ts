import { ValidationError } from '@shared/lib/errors';
import type { TradeSymbol, TradingAccount } from '@shared/types';

function toFiniteRate(value: string | null | undefined): number | null {
	if (value === null || value === undefined || value.trim() === '') {
		return null;
	}
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Non-USD accounts trading USD-quoted symbols (e.g. XAUUSD on an IDR MT5 account)
 * need `quoteToAccountRate` so P&L and balance match the broker.
 */
export function assertAccountFxConfigured(account: TradingAccount, symbol: TradeSymbol): void {
	const accountCurrency = account.currency.trim().toUpperCase();
	const quoteAsset = (symbol.quoteAsset ?? 'USD').trim().toUpperCase();

	if (accountCurrency === quoteAsset) {
		return;
	}

	if (quoteAsset === 'USD' && accountCurrency !== 'USD' && toFiniteRate(account.quoteToAccountRate) === null) {
		throw new ValidationError(
			`Set "USD → Account Rate" for this ${accountCurrency} account under Settings → Accounts so P&L matches MT5.`,
		);
	}
}

export function resolveAccountFxRate(account: TradingAccount): number {
	return toFiniteRate(account.quoteToAccountRate) ?? 1;
}
