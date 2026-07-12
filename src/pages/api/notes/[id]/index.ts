import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse, requireSession } from '@shared/lib/api-response';
import { notesService } from '@features/notes/services/notes.service';
import { ValidationError } from '@shared/lib/errors';

/** PATCH /api/notes/:id — updates a journal note. */
export const PATCH: APIRoute = async ({ request, params }) => {
	try {
		const session = await requireSession(request);
		if (!params.id) {
			throw new ValidationError('Note id is required.');
		}
		const body = await request.json();
		const note = await notesService.update(params.id, session.user.id, body);
		return jsonResponse(note);
	} catch (error) {
		return errorResponse(error);
	}
};

/** DELETE /api/notes/:id — soft-deletes a journal note. */
export const DELETE: APIRoute = async ({ request, params }) => {
	try {
		const session = await requireSession(request);
		if (!params.id) {
			throw new ValidationError('Note id is required.');
		}
		await notesService.remove(params.id, session.user.id);
		return jsonResponse({ success: true });
	} catch (error) {
		return errorResponse(error);
	}
};
