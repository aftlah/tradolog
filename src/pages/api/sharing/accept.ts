import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse, requireSession } from '@shared/lib/api-response';
import { sharingService } from '@features/sharing/services/sharing.service';
import { ValidationError } from '@shared/lib/errors';

/** POST /api/sharing/accept — mentor accepts a pending invite (by id or token). */
export const POST: APIRoute = async ({ request }) => {
	try {
		const session = await requireSession(request);
		const body = (await request.json()) as { id?: string; token?: string };
		if (!body.id && !body.token) {
			throw new ValidationError('Invite id or token is required.');
		}
		const share = await sharingService.acceptInvite(session.user.id, session.user.email, body);
		return jsonResponse(share);
	} catch (error) {
		return errorResponse(error);
	}
};
