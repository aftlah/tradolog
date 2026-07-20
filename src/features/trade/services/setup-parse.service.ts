/**
 * SetupParseService
 *
 * Reads a trading screenshot with Gemini (chart setup OR MT5 position/history list)
 * and returns structured form patches. Image is never persisted.
 *
 * UI → POST /api/trades/parse-setup → SetupParseService → Gemini → { patches }
 */
import { AppError, ValidationError } from '@shared/lib/errors';
import { getEnv } from '@shared/lib/env';
import { parseOrThrow } from '@shared/lib/validation';
import { symbolRepository } from '@shared/repositories';
import { toDatetimeLocalValue } from '../utils/form-defaults';
import {
	setupParseEnvelopeSchema,
	type SetupFormPatch,
	type SetupParseResult,
} from '../validators/setup-parse-schemas';
import {
	ALLOWED_IMAGE_MIME_TYPES,
	DEFAULT_TRADE_QUANTITY,
	MAX_IMAGE_SIZE_BYTES,
} from '../constants/trade.constants';

const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash';

/** Older flash IDs that Google no longer serves to new API keys. */
const DEPRECATED_GEMINI_MODELS = new Set([
	'gemini-2.0-flash',
	'gemini-2.0-flash-001',
	'gemini-2.0-flash-lite',
	'gemini-2.5-flash',
	'gemini-2.5-flash-lite',
]);

function resolveGeminiModel(configured: string | undefined): string {
	const requested = configured?.trim() || DEFAULT_GEMINI_MODEL;
	if (DEPRECATED_GEMINI_MODELS.has(requested)) {
		return DEFAULT_GEMINI_MODEL;
	}
	return requested;
}

const SYSTEM_PROMPT = `You are a trading journal assistant. Extract trade(s) from the screenshot.

The image may be:
1) A chart / setup with Entry, SL, TP lines
2) An MT5 (or similar) positions / history list with one or many rows like:
   "XAUUSD.vx  sell  0.01  4 036.80 → 4 036.03  2026.07.15 05:53:18  14 031.36"

Return ONLY JSON (no markdown) in this shape:
{
  "trades": [
    {
      "symbol": "XAUUSD",
      "side": "sell",
      "status": "closed",
      "entryPrice": 4036.80,
      "exitPrice": 4036.03,
      "stopLoss": null,
      "takeProfit": null,
      "quantity": 0.01,
      "fees": null,
      "openedAt": "2026-07-15T05:53:18",
      "closedAt": "2026-07-15T05:53:18",
      "setup": null,
      "tags": null,
      "confidence": 0.9,
      "notes": null
    }
  ]
}

Rules:
- Always return "trades" as an array (even for a single setup).
- One array item per visible position/history row (max 30).
- Strip broker suffixes from symbol (XAUUSD.vx → XAUUSD).
- side: "buy"|"sell"|"long"|"short" (sell/short = short, buy/long = long).
- For MT5 rows "price → price": first is entryPrice, second is exitPrice.
- Numbers: ignore thousand spaces (4 036.80 → 4036.80). Profit column is NOT entry/exit.
- If a timestamp is shown once for the row, put it in openedAt; if closed P&L is shown use status "closed" and set closedAt to the same timestamp when no separate close time exists.
- For chart setups without exit, prefer status "planned" or "open", exitPrice null.
- Use null for unknown fields. Do not invent prices.`;

interface GeminiGenerateResponse {
	candidates?: Array<{
		content?: {
			parts?: Array<{ text?: string }>;
		};
	}>;
	error?: {
		message?: string;
		status?: string;
	};
}

function assertImageMime(mimeType: string): asserts mimeType is (typeof ALLOWED_IMAGE_MIME_TYPES)[number] {
	if (!(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType)) {
		throw new ValidationError('Use a PNG, JPEG, WebP, or GIF image.');
	}
}

function extractJsonValue(text: string): unknown {
	const trimmed = text.trim();
	const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
	const candidate = fenced?.[1]?.trim() ?? trimmed;
	const objectStart = candidate.indexOf('{');
	const arrayStart = candidate.indexOf('[');
	let start = -1;
	let end = -1;
	if (objectStart === -1 && arrayStart === -1) {
		throw new ValidationError('Could not read trades from this image. Try a clearer screenshot.');
	}
	if (objectStart === -1 || (arrayStart !== -1 && arrayStart < objectStart)) {
		start = arrayStart;
		end = candidate.lastIndexOf(']');
	} else {
		start = objectStart;
		end = candidate.lastIndexOf('}');
	}
	if (start === -1 || end === -1 || end <= start) {
		throw new ValidationError('Could not read trades from this image. Try a clearer screenshot.');
	}
	try {
		const parsed = JSON.parse(candidate.slice(start, end + 1)) as unknown;
		if (Array.isArray(parsed)) {
			return { trades: parsed };
		}
		return parsed;
	} catch {
		throw new ValidationError('Could not parse trade data from the model response.');
	}
}

function mapSide(side: SetupParseResult['side']): 'long' | 'short' | undefined {
	if (!side) {
		return undefined;
	}
	if (side === 'buy' || side === 'long') {
		return 'long';
	}
	if (side === 'sell' || side === 'short') {
		return 'short';
	}
	return undefined;
}

function toFormNumber(value: number | null | undefined): string | undefined {
	if (value === null || value === undefined || !Number.isFinite(value)) {
		return undefined;
	}
	return String(value);
}

function normalizeTicker(ticker: string): string {
	return ticker.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/** Accept MT5 `2026.07.15 05:53:18` alongside ISO strings. */
function normalizeTradeTimestamp(value: string | null | undefined): string | undefined {
	if (!value) {
		return undefined;
	}
	const trimmed = value.trim();
	const mt5 = trimmed.match(
		/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/,
	);
	if (mt5) {
		const year = mt5[1];
		const month = (mt5[2] ?? '1').padStart(2, '0');
		const day = (mt5[3] ?? '1').padStart(2, '0');
		const hour = (mt5[4] ?? '0').padStart(2, '0');
		const minute = (mt5[5] ?? '0').padStart(2, '0');
		const second = (mt5[6] ?? '0').padStart(2, '0');
		return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
	}
	return trimmed;
}

function buildPatchLabel(parsed: SetupParseResult, matchedSymbol: string | null | undefined): string {
	const symbol = matchedSymbol ?? parsed.symbol ?? 'Trade';
	const side = parsed.side ?? '';
	const entry = parsed.entryPrice ?? '—';
	const exit = parsed.exitPrice ?? null;
	const qty = parsed.quantity ?? null;
	const parts = [
		symbol,
		side,
		qty !== null ? `${qty} lot` : null,
		exit !== null ? `${entry}→${exit}` : `entry ${entry}`,
	].filter(Boolean);
	return parts.join(' · ');
}

export class SetupParseService {
	async parseImage(
		userId: string,
		file: { bytes: Uint8Array; mimeType: string; size: number },
	): Promise<SetupFormPatch[]> {
		const env = getEnv();
		const apiKey = env.GEMINI_API_KEY?.trim();
		if (!apiKey) {
			throw new AppError(
				'Setup image fill is not configured. Add GEMINI_API_KEY in your environment.',
				'GEMINI_NOT_CONFIGURED',
				503,
			);
		}

		assertImageMime(file.mimeType);
		if (file.size <= 0 || file.size > MAX_IMAGE_SIZE_BYTES) {
			throw new ValidationError('Image must be under 5 MB.');
		}

		const model = resolveGeminiModel(env.GEMINI_MODEL);
		const base64 = Buffer.from(file.bytes).toString('base64');

		const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

		const response = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				contents: [
					{
						role: 'user',
						parts: [
							{ text: SYSTEM_PROMPT },
							{
								inlineData: {
									mimeType: file.mimeType,
									data: base64,
								},
							},
						],
					},
				],
				generationConfig: {
					responseMimeType: 'application/json',
				},
			}),
		});

		const payload = (await response.json()) as GeminiGenerateResponse;
		if (!response.ok) {
			const message = payload.error?.message ?? `Gemini request failed (${model}).`;
			throw new AppError(message, 'GEMINI_REQUEST_FAILED', response.status >= 400 ? response.status : 502);
		}

		const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('\n') ?? '';
		if (!text.trim()) {
			throw new ValidationError('No trade details were detected in this image.');
		}

		const envelope = parseOrThrow(setupParseEnvelopeSchema, extractJsonValue(text));
		const symbols = await symbolRepository.listForUser(userId);
		return envelope.trades.map((trade) => this.toFormPatch(trade, symbols));
	}

	private toFormPatch(
		parsed: SetupParseResult,
		symbols: Awaited<ReturnType<typeof symbolRepository.listForUser>>,
	): SetupFormPatch {
		const patch: SetupFormPatch = {
			confidence: parsed.confidence ?? null,
			notes: parsed.notes ?? null,
		};

		if (parsed.symbol) {
			const wanted = normalizeTicker(parsed.symbol);
			const match =
				symbols.find((symbol) => normalizeTicker(symbol.ticker) === wanted) ??
				symbols.find(
					(symbol) =>
						normalizeTicker(symbol.ticker).includes(wanted) ||
						wanted.includes(normalizeTicker(symbol.ticker)),
				);

			if (match) {
				patch.symbolId = match.id;
				patch.matchedSymbol = match.ticker;
			} else {
				patch.unmatchedSymbol = parsed.symbol;
			}
		}

		const side = mapSide(parsed.side);
		if (side) {
			patch.side = side;
		}
		if (parsed.status) {
			patch.status = parsed.status;
		} else if (parsed.exitPrice != null) {
			patch.status = 'closed';
		}
		if (parsed.session) {
			patch.session = parsed.session;
		}

		const entry = toFormNumber(parsed.entryPrice);
		if (entry !== undefined) patch.entryPrice = entry;
		const exit = toFormNumber(parsed.exitPrice);
		if (exit !== undefined) patch.exitPrice = exit;
		const stop = toFormNumber(parsed.stopLoss);
		if (stop !== undefined) patch.stopLoss = stop;
		const take = toFormNumber(parsed.takeProfit);
		if (take !== undefined) patch.takeProfit = take;
		const qty = toFormNumber(parsed.quantity);
		patch.quantity = qty ?? String(DEFAULT_TRADE_QUANTITY);
		const fees = toFormNumber(parsed.fees);
		if (fees !== undefined) patch.fees = fees;

		const openedAt = toDatetimeLocalValue(normalizeTradeTimestamp(parsed.openedAt ?? undefined));
		if (openedAt) patch.openedAt = openedAt;
		const closedRaw = normalizeTradeTimestamp(parsed.closedAt ?? undefined) ??
			(patch.status === 'closed' ? normalizeTradeTimestamp(parsed.openedAt ?? undefined) : undefined);
		const closedAt = toDatetimeLocalValue(closedRaw);
		if (closedAt) patch.closedAt = closedAt;

		if (parsed.setup) patch.setup = parsed.setup;
		if (parsed.tags) patch.tags = parsed.tags;

		patch.label = buildPatchLabel(parsed, patch.matchedSymbol);

		return patch;
	}
}

export const setupParseService = new SetupParseService();
