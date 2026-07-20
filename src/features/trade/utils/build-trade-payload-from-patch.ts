import { datetimeLocalToIso, toDatetimeLocalValue } from '@shared/utils/datetime';
import { DEFAULT_TRADE_QUANTITY } from '../constants/trade.constants';
import { applyExitPriceCloseFields } from './apply-exit-price-close';
import { inferTradeSide } from './infer-trade-side';
import type { SetupFormPatch } from '../validators/setup-parse-schemas';

function toPositiveNumber(value: string | undefined): number | null {
	if (value === undefined || value.trim() === '') {
		return null;
	}
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function toNonNegativeNumber(value: string | undefined): number | null {
	if (value === undefined || value.trim() === '') {
		return null;
	}
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export type TradeCreatePayloadFromPatch = {
	accountId: string;
	symbolId: string;
	strategyId: null;
	side: 'long' | 'short';
	status: 'planned' | 'open' | 'closed' | 'cancelled';
	session: 'asian' | 'london' | 'new_york' | 'overlap' | null;
	entryPrice: number;
	exitPrice: number | null;
	stopLoss: number | null;
	takeProfit: number | null;
	quantity: number;
	fees: number;
	openedAt: string;
	closedAt: string | null;
	setup: string | null;
	tags: string | null;
	mistakes: null;
	lessons: null;
};

/**
 * Build a create-trade API body from an image-parse patch.
 * Prefers patch.side (MT5 buy/sell) when SL/TP are missing.
 */
export function buildTradePayloadFromPatch(
	accountId: string,
	patch: SetupFormPatch,
): { ok: true; payload: TradeCreatePayloadFromPatch } | { ok: false; error: string } {
	if (!patch.symbolId) {
		return {
			ok: false,
			error: patch.unmatchedSymbol
				? `Symbol “${patch.unmatchedSymbol}” belum ada di list.`
				: 'Symbol tidak terdeteksi.',
		};
	}

	const entryPrice = toPositiveNumber(patch.entryPrice);
	const quantity = toPositiveNumber(patch.quantity) ?? DEFAULT_TRADE_QUANTITY;
	if (entryPrice === null) {
		return { ok: false, error: 'Entry price wajib.' };
	}

	const stopLoss = toPositiveNumber(patch.stopLoss);
	const takeProfit = toPositiveNumber(patch.takeProfit);
	const exitPrice = toPositiveNumber(patch.exitPrice);
	const side = patch.side ?? inferTradeSide(entryPrice, stopLoss, takeProfit);
	if (!side) {
		return { ok: false, error: 'Side tidak jelas (butuh buy/sell atau SL/TP).' };
	}

	const nowLocal = toDatetimeLocalValue(new Date().toISOString());
	const openedLocal =
		typeof patch.openedAt === 'string' && patch.openedAt.trim() !== '' ? patch.openedAt : nowLocal;

	const session =
		patch.session === 'asian' ||
		patch.session === 'london' ||
		patch.session === 'new_york' ||
		patch.session === 'overlap'
			? patch.session
			: null;

	const fees = toNonNegativeNumber(patch.fees) ?? 0;

	const withClose = applyExitPriceCloseFields(
		{
			exitPrice,
			status: patch.status ?? (exitPrice !== null ? 'closed' : 'open'),
			closedAt:
				typeof patch.closedAt === 'string' && patch.closedAt.trim() !== ''
					? patch.closedAt
					: undefined,
		},
		nowLocal,
	);

	const closedAtRaw =
		typeof withClose.closedAt === 'string' && withClose.closedAt.trim() !== ''
			? withClose.closedAt
			: null;

	return {
		ok: true,
		payload: {
			accountId,
			symbolId: patch.symbolId,
			strategyId: null,
			side,
			status: withClose.status,
			session,
			entryPrice,
			exitPrice,
			stopLoss,
			takeProfit,
			quantity,
			fees,
			openedAt: datetimeLocalToIso(openedLocal),
			closedAt: closedAtRaw ? datetimeLocalToIso(closedAtRaw) : null,
			setup: patch.setup?.trim() ? patch.setup : null,
			tags: patch.tags?.trim() ? patch.tags : null,
			mistakes: null,
			lessons: null,
		},
	};
}
