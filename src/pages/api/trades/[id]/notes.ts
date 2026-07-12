import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse, requireSession } from '@shared/lib/api-response';
import { tradeJournalService } from '@features/trade/services/trade-journal.service';
import { ValidationError } from '@shared/lib/errors';

/** POST /api/trades/:id/notes — appends a timestamped trade note. */
export const POST: APIRoute = async ({ request, params }) => {
	try {
		const session = await requireSession(request);
		if (!params.id) {
			throw new ValidationError('Trade id is required.');
		}
		const body = await request.json();
		const note = await tradeJournalService.addNote(params.id, session.user.id, body);
		return jsonResponse(note, 201);
	} catch (error) {
		return errorResponse(error);
	}
};
