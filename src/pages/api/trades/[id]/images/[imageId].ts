import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse, requireSession } from '@shared/lib/api-response';
import { tradeJournalService } from '@features/trade/services/trade-journal.service';
import { ValidationError } from '@shared/lib/errors';

/** DELETE /api/trades/:id/images/:imageId — removes a screenshot from both R2 and the DB. */
export const DELETE: APIRoute = async ({ request, params }) => {
	try {
		const session = await requireSession(request);
		if (!params.id || !params.imageId) {
			throw new ValidationError('Trade id and image id are required.');
		}
		await tradeJournalService.removeImage(params.id, params.imageId, session.user.id);
		return jsonResponse({ success: true });
	} catch (error) {
		return errorResponse(error);
	}
};
