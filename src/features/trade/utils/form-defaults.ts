import type { TradeFormInput } from '../validators/trade-schemas';
import type { TradeDetail } from '../types/trade.types';

/**
 * Converts an ISO timestamp into the `yyyy-MM-ddTHH:mm` string `<input type="datetime-local">` expects.
 *
 * Uses the **runtime local timezone**. Never call this during SSR hydration of a `client:load`
 * island — Vercel (UTC) and the browser (e.g. Asia/Jakarta) produce different strings and throw
 * React error #418. Trade create/edit shells must use `client:only="react"`.
 */
export function toDatetimeLocalValue(iso: string | null | undefined): string {
	if (!iso) {
		return '';
	}
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) {
		return '';
	}
	const pad = (value: number) => String(value).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toInputValue(value: number | null): string {
	return value === null ? '' : String(value);
}

/**
 * Builds the initial React Hook Form state for the Trade form.
 *
 * Only safe to call in a client-only context (or after mount). See `toDatetimeLocalValue`.
 */
export function getTradeFormDefaults(
	detail?: TradeDetail | null,
	defaultAccountId?: string | null,
	nowIso?: string,
): TradeFormInput {
	if (!detail) {
		return {
			accountId: defaultAccountId ?? '',
			symbolId: '',
			strategyId: '',
			side: 'long',
			status: 'planned',
			session: '',
			entryPrice: '',
			exitPrice: '',
			stopLoss: '',
			takeProfit: '',
			quantity: '',
			fees: '',
			openedAt: toDatetimeLocalValue(nowIso),
			closedAt: '',
			tags: '',
			setup: '',
			mistakes: '',
			lessons: '',
		};
	}

	return {
		accountId: detail.accountId,
		symbolId: detail.symbolId,
		strategyId: detail.strategyId ?? '',
		side: detail.side,
		status: detail.status,
		session: detail.session ?? '',
		entryPrice: toInputValue(detail.entryPrice),
		exitPrice: toInputValue(detail.exitPrice),
		stopLoss: toInputValue(detail.stopLoss),
		takeProfit: toInputValue(detail.takeProfit),
		quantity: toInputValue(detail.quantity),
		fees: toInputValue(detail.fees),
		openedAt: toDatetimeLocalValue(detail.openedAt),
		closedAt: toDatetimeLocalValue(detail.closedAt),
		tags: detail.tags ?? '',
		setup: detail.setup ?? '',
		mistakes: detail.mistakes ?? '',
		lessons: detail.lessons ?? '',
	};
}
