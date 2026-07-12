import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse, requireSession } from '@shared/lib/api-response';
import { goalsService } from '@features/goals/services/goals.service';

/** GET /api/goals — every monthly goal for the user, with actuals computed for the given (optional) account. */
export const GET: APIRoute = async ({ request, url }) => {
	try {
		const session = await requireSession(request);
		const accountId = url.searchParams.get('accountId') ?? undefined;
		const goals = await goalsService.listWithProgress(session.user.id, accountId);
		return jsonResponse(goals);
	} catch (error) {
		return errorResponse(error);
	}
};

/** POST /api/goals — creates a monthly goal. */
export const POST: APIRoute = async ({ request }) => {
	try {
		const session = await requireSession(request);
		const body = await request.json();
		const goal = await goalsService.create(session.user.id, body);
		return jsonResponse(goal, 201);
	} catch (error) {
		return errorResponse(error);
	}
};
