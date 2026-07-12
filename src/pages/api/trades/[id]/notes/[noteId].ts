import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse, requireSession } from '@shared/lib/api-response';
import { tradeJournalService } from '@features/trade/services/trade-journal.service';
import { ValidationError } from '@shared/lib/errors';

/** DELETE /api/trades/:id/notes/:noteId — removes a trade note. */
export const DELETE: APIRoute = async ({ request, params }) => {
	try {
		const session = await requireSession(request);
		if (!params.id || !params.noteId) {
			throw new ValidationError('Trade id and note id are required.');
		}
		await tradeJournalService.removeNote(params.id, params.noteId, session.user.id);
		return jsonResponse({ success: true });
	} catch (error) {
		return errorResponse(error);
	}
};
