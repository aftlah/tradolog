import { XAUUSD_CONTRACT_SIZE, XAUUSD_TICKER } from '../constants/trade.constants';

/** Standard FX lot = 100,000 units of base currency (EURUSD, GBPUSD, …). */
export const STANDARD_FOREX_CONTRACT_SIZE = 100_000;

/** Strip broker suffixes (`GBPUSD.vx` → `GBPUSD`). */
export function normalizeSymbolTicker(ticker: string): string {
	const trimmed = ticker.trim().toUpperCase();
	const base = trimmed.split(/[./]/)[0];
	return base && base.length > 0 ? base : trimmed;
}

/**
 * Contract size for P&L = price move × lots × contractSize (quote currency), then × FX.
 * Prefers the stored symbol value; otherwise uses known defaults (XAU=100, majors=100_000).
 */
export function resolveSymbolContractSize(ticker: string, stored: number | null | undefined): number {
	if (stored !== null && stored !== undefined && Number.isFinite(stored) && stored > 0) {
		return stored;
	}

	const base = normalizeSymbolTicker(ticker);
	if (base === XAUUSD_TICKER || base.startsWith('XAU')) {
		return XAUUSD_CONTRACT_SIZE;
	}

	// Major / cross FX: six-letter tickers (EURUSD, USDJPY, GBPJPY, …) — not crypto/indices.
	if (/^[A-Z]{6}$/.test(base) && !base.startsWith('BTC') && !base.startsWith('ETH')) {
		return STANDARD_FOREX_CONTRACT_SIZE;
	}

	return 1;
}
