import type { TradeSymbolOption } from '../types/trade.types';
import type { SetupFormPatch } from '../validators/setup-parse-schemas';

/** Normalize broker suffixes (`GBPUSD.vx` → `GBPUSDVX` compare key without junk). */
export function normalizeTickerKey(ticker: string): string {
	return ticker.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function parseLooseNumber(raw: string): number | null {
	const cleaned = raw
		.trim()
		.replace(/\s/g, '')
		.replace(/,(?=\d{3}\b)/g, '')
		.replace(',', '.');
	const match = cleaned.match(/-?\d+(?:\.\d+)?/);
	if (!match) {
		return null;
	}
	const value = Number.parseFloat(match[0]);
	return Number.isFinite(value) ? value : null;
}

function toFormNumber(value: number | null): string | undefined {
	if (value === null || !Number.isFinite(value) || value <= 0) {
		return undefined;
	}
	return String(value);
}

function matchSymbolId(
	rawTicker: string | null,
	symbols: readonly TradeSymbolOption[],
): { symbolId?: string; matchedSymbol?: string; unmatchedSymbol?: string } {
	if (!rawTicker) {
		return {};
	}
	const wanted = normalizeTickerKey(rawTicker);
	const match =
		symbols.find((symbol) => normalizeTickerKey(symbol.ticker) === wanted) ??
		symbols.find(
			(symbol) =>
				normalizeTickerKey(symbol.ticker).includes(wanted) ||
				wanted.includes(normalizeTickerKey(symbol.ticker)),
		);
	if (match) {
		return { symbolId: match.id, matchedSymbol: match.ticker };
	}
	return { unmatchedSymbol: rawTicker.toUpperCase() };
}

const LABEL_PATTERNS: Array<{
	keys: RegExp;
	field: 'entryPrice' | 'exitPrice' | 'stopLoss' | 'takeProfit' | 'quantity' | 'fees';
}> = [
	{ keys: /^(?:entry(?:\s*price)?|open(?:\s*price)?|harga\s*entry|limit)$/i, field: 'entryPrice' },
	{ keys: /^(?:exit(?:\s*price)?|close(?:\s*price)?|harga\s*exit)$/i, field: 'exitPrice' },
	{ keys: /^(?:sl|s\/l|stop(?:\s*loss)?|stop)$/i, field: 'stopLoss' },
	{ keys: /^(?:tp|t\/p|take(?:\s*profit)?|target)$/i, field: 'takeProfit' },
	{ keys: /^(?:lots?|volume|qty|quantity|size|lot\s*size)$/i, field: 'quantity' },
	{ keys: /^(?:fees?|commission|komisi)$/i, field: 'fees' },
];

/**
 * Parse pasted MT5 / chat / journal text into a trade form patch.
 * Supports labeled lines, buy/sell + lots, and bare tickers.
 */
export function parseTradeEntryText(
	text: string,
	symbols: readonly TradeSymbolOption[],
): SetupFormPatch {
	const patch: SetupFormPatch = {};
	const source = text.replace(/\u00a0/g, ' ').trim();
	if (!source) {
		return patch;
	}

	let detectedTicker: string | null = null;
	let detectedSide: 'long' | 'short' | undefined;
	const numbers: Partial<Record<'entryPrice' | 'exitPrice' | 'stopLoss' | 'takeProfit' | 'quantity' | 'fees', number>> =
		{};

	const lower = source.toLowerCase();
	for (const symbol of symbols) {
		const key = normalizeTickerKey(symbol.ticker);
		if (key.length >= 6 && normalizeTickerKey(source).includes(key)) {
			detectedTicker = symbol.ticker;
			break;
		}
		if (lower.includes(symbol.ticker.toLowerCase())) {
			detectedTicker = symbol.ticker;
			break;
		}
	}

	const lines = source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

	for (const line of lines) {
		const sideWord = line.match(/\b(sell|buy|short|long)\b/i)?.[1]?.toLowerCase();
		if (sideWord === 'sell' || sideWord === 'short') {
			detectedSide = 'short';
		} else if (sideWord === 'buy' || sideWord === 'long') {
			detectedSide = 'long';
		}

		// Lots only when clearly a lot size: "SELL LIMIT 0.02" / "short 0.02 lot"
		const pendingLots = line.match(
			/\b(?:sell\s*limit|buy\s*limit|sell\s*stop|buy\s*stop)\b\s+([\d.,]+)/i,
		);
		const explicitLots = line.match(/\b(?:sell|buy|short|long)\b\s+([\d.,]+)\s*(?:lot|lots)\b/i);
		const lotsMatch = pendingLots ?? explicitLots;
		if (lotsMatch) {
			const qty = parseLooseNumber(lotsMatch[1] ?? '');
			if (qty !== null && numbers.quantity === undefined) {
				numbers.quantity = qty;
			}
		}

		const tickerInline = line.match(/\b([A-Z]{3,10}(?:USD|JPY|EUR|GBP|AUD|CAD|CHF|NZD|XAU|BTC)?)\b/i);
		if (tickerInline && !detectedTicker) {
			const candidate = tickerInline[1] ?? '';
			if (/^[A-Za-z]{6,10}$/.test(candidate) || /USD|XAU|BTC/i.test(candidate)) {
				detectedTicker = candidate;
			}
		}

		// MT5 mobile: "SL, -57 711.72 IDR, 160 points" — price is usually on nearby horizontal labels;
		// also accept "SL: 1.34431" / "SL 1.34431".
		const labeled = line.match(
			/^(entry(?:\s*price)?|exit(?:\s*price)?|sl|s\/l|stop(?:\s*loss)?|tp|t\/p|take(?:\s*profit)?|lots?|volume|qty|quantity|fees?|commission)\s*[:\-=]?\s*(.+)$/i,
		);
		if (labeled) {
			const label = labeled[1] ?? '';
			const rest = labeled[2] ?? '';
			const mapping = LABEL_PATTERNS.find((item) => item.keys.test(label));
			if (mapping) {
				// Prefer the first price-like token that looks like a market price / lot (not the big IDR P&L).
				const tokens = rest.split(/[,|;]+/).map((part) => part.trim()).filter(Boolean);
				let chosen: number | null = null;
				for (const token of tokens) {
					if (/idr|usd|points?|pips?/i.test(token) && !/^\d/.test(token.trim())) {
						continue;
					}
					const value = parseLooseNumber(token);
					if (value === null) {
						continue;
					}
					// Skip large IDR money amounts when looking for FX prices / lot sizes.
					if (mapping.field !== 'fees' && mapping.field !== 'quantity' && Math.abs(value) >= 1000) {
						continue;
					}
					chosen = value;
					break;
				}
				if (chosen !== null) {
					numbers[mapping.field] = Math.abs(chosen);
				}
			}
		}

		// "SL 1.34431" without colon
		const spaced = line.match(
			/^(entry|exit|sl|tp|lots?|qty|volume)\s+([\d.]+(?:\d)?)\b/i,
		);
		if (spaced) {
			const mapping = LABEL_PATTERNS.find((item) => item.keys.test(spaced[1] ?? ''));
			const value = parseLooseNumber(spaced[2] ?? '');
			if (mapping && value !== null) {
				numbers[mapping.field] = Math.abs(value);
			}
		}
	}

	// Single-line compact paste: "GBPUSD short 1.34271 1.34431 1.33957 0.02"
	if (Object.keys(numbers).length < 2) {
		const tokens = source.split(/[\s,;|/]+/).filter(Boolean);
		const priceLike: number[] = [];
		for (const token of tokens) {
			if (/^(sell|buy|short|long|limit|stop)$/i.test(token)) {
				if (/sell|short/i.test(token)) detectedSide = 'short';
				if (/buy|long/i.test(token)) detectedSide = 'long';
				continue;
			}
			if (/^[A-Za-z]{6,12}(?:\.[A-Za-z]+)?$/.test(token) && /[A-Za-z]{3}/.test(token)) {
				detectedTicker = detectedTicker ?? token.split('.')[0] ?? token;
				continue;
			}
			const value = parseLooseNumber(token);
			if (value !== null && value > 0) {
				priceLike.push(value);
			}
		}
		if (priceLike.length >= 3) {
			// entry, sl, tp[, lots] — lots is usually the smallest trailing value (< 100)
			if (numbers.entryPrice === undefined) numbers.entryPrice = priceLike[0];
			if (numbers.stopLoss === undefined) numbers.stopLoss = priceLike[1];
			if (numbers.takeProfit === undefined) numbers.takeProfit = priceLike[2];
			const maybeLots = priceLike.length >= 4 ? priceLike[priceLike.length - 1] : undefined;
			if (
				maybeLots !== undefined &&
				numbers.quantity === undefined &&
				maybeLots < 100 &&
				maybeLots !== numbers.entryPrice &&
				maybeLots !== numbers.stopLoss &&
				maybeLots !== numbers.takeProfit
			) {
				numbers.quantity = maybeLots;
			}
		}
	}

	const symbolMeta = matchSymbolId(detectedTicker, symbols);
	Object.assign(patch, symbolMeta);

	if (detectedSide) {
		patch.side = detectedSide;
	}

	const entry = toFormNumber(numbers.entryPrice ?? null);
	if (entry) patch.entryPrice = entry;
	const exit = toFormNumber(numbers.exitPrice ?? null);
	if (exit) patch.exitPrice = exit;
	const sl = toFormNumber(numbers.stopLoss ?? null);
	if (sl) patch.stopLoss = sl;
	const tp = toFormNumber(numbers.takeProfit ?? null);
	if (tp) patch.takeProfit = tp;
	const qty = toFormNumber(numbers.quantity ?? null);
	if (qty) patch.quantity = qty;
	const fees = toFormNumber(numbers.fees ?? null);
	if (fees) patch.fees = fees;

	if (!patch.status && (patch.entryPrice || patch.stopLoss || patch.takeProfit)) {
		patch.status = 'open';
	}

	return patch;
}

export function countFilledPatchFields(patch: SetupFormPatch): number {
	const keys: Array<keyof SetupFormPatch> = [
		'symbolId',
		'side',
		'status',
		'session',
		'entryPrice',
		'exitPrice',
		'stopLoss',
		'takeProfit',
		'quantity',
		'fees',
		'openedAt',
		'closedAt',
		'setup',
		'tags',
	];
	return keys.reduce((count, key) => {
		const value = patch[key];
		return value === undefined || value === null || value === '' ? count : count + 1;
	}, 0);
}
