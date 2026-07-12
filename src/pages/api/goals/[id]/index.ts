import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse, requireSession } from '@shared/lib/api-response';
import { goalsService } from '@features/goals/services/goals.service';
import { ValidationError } from '@shared/lib/errors';

/** PATCH /api/goals/:id — updates a monthly goal; actuals are recomputed server-side. */
export const PATCH: APIRoute = async ({ request, params }) => {
	try {
		const session = await requireSession(request);
		if (!params.id) {
			throw new ValidationError('Goal id is required.');
		}
		const body = await request.json();
		const goal = await goalsService.update(params.id, session.user.id, body);
		return jsonResponse(goal);
	} catch (error) {
		return errorResponse(error);
	}
};

/** DELETE /api/goals/:id — soft-deletes a monthly goal. */
export const DELETE: APIRoute = async ({ request, params }) => {
	try {
		const session = await requireSession(request);
		if (!params.id) {
			throw new ValidationError('Goal id is required.');
		}
		await goalsService.remove(params.id, session.user.id);
		return jsonResponse({ success: true });
	} catch (error) {
		return errorResponse(error);
	}
};
