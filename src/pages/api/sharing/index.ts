import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse, requireSession } from '@shared/lib/api-response';
import { sharingService } from '@features/sharing/services/sharing.service';

/** GET /api/sharing — outgoing + incoming shares for the signed-in user. */
export const GET: APIRoute = async ({ request }) => {
	try {
		const session = await requireSession(request);
		const data = await sharingService.getPageData(session.user.id, session.user.email);
		return jsonResponse(data);
	} catch (error) {
		return errorResponse(error);
	}
};

/** POST /api/sharing — owner invites a mentor by email. */
export const POST: APIRoute = async ({ request }) => {
	try {
		const session = await requireSession(request);
		const body = await request.json();
		const share = await sharingService.inviteMentor(session.user.id, session.user.email, body);
		return jsonResponse(share, 201);
	} catch (error) {
		return errorResponse(error);
	}
};
