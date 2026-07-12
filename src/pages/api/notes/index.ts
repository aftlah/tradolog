import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse, requireSession } from '@shared/lib/api-response';
import { notesService } from '@features/notes/services/notes.service';

/** GET /api/notes — every journal note for the user, pinned first. */
export const GET: APIRoute = async ({ request }) => {
	try {
		const session = await requireSession(request);
		const notes = await notesService.list(session.user.id);
		return jsonResponse(notes);
	} catch (error) {
		return errorResponse(error);
	}
};

/** POST /api/notes — creates a journal note. */
export const POST: APIRoute = async ({ request }) => {
	try {
		const session = await requireSession(request);
		const body = await request.json();
		const note = await notesService.create(session.user.id, body);
		return jsonResponse(note, 201);
	} catch (error) {
		return errorResponse(error);
	}
};
