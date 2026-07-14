import type { TradeStatus } from '@shared/types';

function toFinitePositive(value: unknown): number | null {
	if (typeof value === 'number') {
		return Number.isFinite(value) && value > 0 ? value : null;
	}
	if (typeof value !== 'string') {
		return null;
	}
	const trimmed = value.trim();
	if (!trimmed) {
		return null;
	}
	const parsed = Number.parseFloat(trimmed);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/** True when exit price is a positive number (raw form string or coerced schema value). */
export function hasValidExitPrice(exitPrice: unknown): boolean {
	return toFinitePositive(exitPrice) !== null;
}

type ExitPriceCloseFields = {
	exitPrice?: unknown;
	status: TradeStatus;
	closedAt?: unknown;
};

/**
 * When exit price is set, mark the trade closed and default `closedAt` if empty.
 * Pure — callers supply the default closed timestamp (datetime-local or ISO).
 */
export function applyExitPriceCloseFields<T extends ExitPriceCloseFields>(
	fields: T,
	defaultClosedAt: string,
): T {
	if (!hasValidExitPrice(fields.exitPrice)) {
		return fields;
	}

	const closedAt =
		typeof fields.closedAt === 'string' && fields.closedAt.trim() !== '' ? fields.closedAt : defaultClosedAt;

	return {
		...fields,
		status: 'closed',
		closedAt,
	};
}
