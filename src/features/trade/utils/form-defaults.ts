import type { TradeFormInput } from '../validators/trade-schemas';
import type { TradeDetail } from '../types/trade.types';
import { toDatetimeLocalValue } from '@shared/utils/datetime';

export { toDatetimeLocalValue } from '@shared/utils/datetime';

function toInputValue(value: number | null): string {
	return value === null ? '' : String(value);
}

/**
 * Builds the initial React Hook Form state for the Trade form.
 * Datetimes use Asia/Jakarta wall clock for `<input type="datetime-local">`.
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
