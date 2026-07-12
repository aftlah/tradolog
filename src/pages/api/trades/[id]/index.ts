import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse, requireSession } from '@shared/lib/api-response';
import { tradeJournalService } from '@features/trade/services/trade-journal.service';
import { ValidationError } from '@shared/lib/errors';

/** GET /api/trades/:id — full trade detail (metrics, images, notes). */
export const GET: APIRoute = async ({ request, params }) => {
	try {
		const session = await requireSession(request);
		if (!params.id) {
			throw new ValidationError('Trade id is required.');
		}
		const trade = await tradeJournalService.getDetail(params.id, session.user.id);
		return jsonResponse(trade);
	} catch (error) {
		return errorResponse(error);
	}
};

/** PATCH /api/trades/:id — updates a trade; every derived metric is recomputed server-side. */
export const PATCH: APIRoute = async ({ request, params }) => {
	try {
		const session = await requireSession(request);
		if (!params.id) {
			throw new ValidationError('Trade id is required.');
		}
		const body = await request.json();
		const trade = await tradeJournalService.update(params.id, session.user.id, body);
		return jsonResponse(trade);
	} catch (error) {
		return errorResponse(error);
	}
};

/** DELETE /api/trades/:id — soft-deletes a trade (history is never hard-deleted). */
export const DELETE: APIRoute = async ({ request, params }) => {
	try {
		const session = await requireSession(request);
		if (!params.id) {
			throw new ValidationError('Trade id is required.');
		}
		await tradeJournalService.remove(params.id, session.user.id);
		return jsonResponse({ success: true });
	} catch (error) {
		return errorResponse(error);
	}
};
