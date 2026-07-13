/**
 * SetupParseService
 *
 * Reads a trading setup screenshot with Gemini (free-tier flash model) and returns
 * structured fields for the trade form. The image is never persisted — only held in memory
 * for the duration of the request.
 *
 * UI → POST /api/trades/parse-setup → SetupParseService → Gemini → form patch JSON
 */
import { AppError, ValidationError } from '@shared/lib/errors';
import { getEnv } from '@shared/lib/env';
import { parseOrThrow } from '@shared/lib/validation';
import { symbolRepository } from '@shared/repositories';
import { toDatetimeLocalValue } from '../utils/form-defaults';
import {
	setupParseResultSchema,
	type SetupFormPatch,
	type SetupParseResult,
} from '../validators/setup-parse-schemas';
import {
	ALLOWED_IMAGE_MIME_TYPES,
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

const SYSTEM_PROMPT = `You are a trading journal assistant. Extract trade setup values from the screenshot.
Return ONLY a JSON object (no markdown) with these keys when visible:
- symbol (string ticker e.g. XAUUSD, EURUSD)
- side ("long"|"short"|"buy"|"sell")
- status ("planned"|"open"|"closed"|"cancelled") — prefer "planned" for an unfilled setup chart
- session ("asian"|"london"|"new_york"|"overlap") if obvious
- entryPrice, exitPrice, stopLoss, takeProfit, quantity (lots), fees (numbers)
- openedAt, closedAt (ISO-8601 if timestamps are visible)
- setup (short text describing the setup if labeled)
- tags (comma-separated short tags if any)
- confidence (0-1 how sure you are)
- notes (optional short caveat)
Use null for unknown fields. Do not invent prices that are not readable.`;

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

function extractJsonObject(text: string): unknown {
	const trimmed = text.trim();
	const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
	const candidate = fenced?.[1]?.trim() ?? trimmed;
	const start = candidate.indexOf('{');
	const end = candidate.lastIndexOf('}');
	if (start === -1 || end === -1 || end <= start) {
		throw new ValidationError('Could not read a setup from this image. Try a clearer screenshot.');
	}
	try {
		return JSON.parse(candidate.slice(start, end + 1)) as unknown;
	} catch {
		throw new ValidationError('Could not parse setup data from the model response.');
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

export class SetupParseService {
	async parseImage(
		userId: string,
		file: { bytes: Uint8Array; mimeType: string; size: number },
	): Promise<SetupFormPatch> {
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
			throw new ValidationError('No setup details were detected in this image.');
		}

		const parsed = parseOrThrow(setupParseResultSchema, extractJsonObject(text));
		return this.toFormPatch(userId, parsed);
	}

	private async toFormPatch(userId: string, parsed: SetupParseResult): Promise<SetupFormPatch> {
		const patch: SetupFormPatch = {
			confidence: parsed.confidence ?? null,
			notes: parsed.notes ?? null,
		};

		if (parsed.symbol) {
			const symbols = await symbolRepository.listForUser(userId);
			const wanted = normalizeTicker(parsed.symbol);
			const match =
				symbols.find((symbol) => normalizeTicker(symbol.ticker) === wanted) ??
				symbols.find((symbol) => normalizeTicker(symbol.ticker).includes(wanted) || wanted.includes(normalizeTicker(symbol.ticker)));

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
		if (qty !== undefined) patch.quantity = qty;
		const fees = toFormNumber(parsed.fees);
		if (fees !== undefined) patch.fees = fees;

		const openedAt = toDatetimeLocalValue(parsed.openedAt ?? undefined);
		if (openedAt) patch.openedAt = openedAt;
		const closedAt = toDatetimeLocalValue(parsed.closedAt ?? undefined);
		if (closedAt) patch.closedAt = closedAt;

		if (parsed.setup) patch.setup = parsed.setup;
		if (parsed.tags) patch.tags = parsed.tags;

		return patch;
	}
}

export const setupParseService = new SetupParseService();
