import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse, requireSession } from '@shared/lib/api-response';
import { tradeJournalService } from '@features/trade/services/trade-journal.service';
import { parseTradeListQuery } from '@features/trade/utils/query';

/** GET /api/trades — paginated, filtered, sorted, searchable trade list. */
export const GET: APIRoute = async ({ request, url }) => {
	try {
		const session = await requireSession(request);
		const query = parseTradeListQuery(url.searchParams);
		const result = await tradeJournalService.listPaginated(session.user.id, query);
		return jsonResponse(result);
	} catch (error) {
		return errorResponse(error);
	}
};

/** POST /api/trades — creates a trade; every derived metric is computed server-side. */
export const POST: APIRoute = async ({ request }) => {
	try {
		const session = await requireSession(request);
		const body = await request.json();
		const trade = await tradeJournalService.create(session.user.id, body);
		return jsonResponse(trade, 201);
	} catch (error) {
		return errorResponse(error);
	}
};
