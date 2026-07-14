import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse, requireSession } from '@shared/lib/api-response';
import { sharingService } from '@features/sharing/services/sharing.service';
import { NotFoundError } from '@shared/lib/errors';

/** GET /api/sharing/:id — mentor read-only journal view. */
export const GET: APIRoute = async ({ request, params }) => {
	try {
		const session = await requireSession(request);
		const shareId = params.id;
		if (!shareId) {
			throw new NotFoundError('Share not found.');
		}
		const url = new URL(request.url);
		const accountId = url.searchParams.get('accountId');
		const view = await sharingService.getSharedJournalView(
			shareId,
			session.user.id,
			session.user.email,
			accountId,
		);
		return jsonResponse(view);
	} catch (error) {
		return errorResponse(error);
	}
};

/** DELETE /api/sharing/:id — owner revokes, or mentor leaves. */
export const DELETE: APIRoute = async ({ request, params }) => {
	try {
		const session = await requireSession(request);
		const shareId = params.id;
		if (!shareId) {
			throw new NotFoundError('Share not found.');
		}
		const url = new URL(request.url);
		const as = url.searchParams.get('as');
		if (as === 'mentor') {
			await sharingService.leaveShare(session.user.id, session.user.email, shareId);
		} else {
			await sharingService.revokeShare(session.user.id, shareId);
		}
		return jsonResponse({ ok: true });
	} catch (error) {
		return errorResponse(error);
	}
};
