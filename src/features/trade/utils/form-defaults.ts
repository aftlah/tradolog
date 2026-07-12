import type { TradeFormInput } from '../validators/trade-schemas';
import type { TradeDetail } from '../types/trade.types';

function toDatetimeLocalValue(iso: string | null): string {
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
 * Builds the initial React Hook Form state for the Trade form: blank/"now" defaults for Create,
 * or the existing trade's values (converted back to plain strings) for Edit.
 */
export function getTradeFormDefaults(detail?: TradeDetail | null, defaultAccountId?: string | null): TradeFormInput {
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
			openedAt: toDatetimeLocalValue(new Date().toISOString()),
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
