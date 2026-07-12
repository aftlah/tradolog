import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse, requireSession } from '@shared/lib/api-response';
import { settingsService } from '@features/settings/services/settings.service';

/** GET /api/settings/strategies — the current user's strategies/playbooks. */
export const GET: APIRoute = async ({ request }) => {
	try {
		const session = await requireSession(request);
		const { strategies } = await settingsService.getSettingsPageData(session.user.id);
		return jsonResponse(strategies);
	} catch (error) {
		return errorResponse(error);
	}
};

/** POST /api/settings/strategies — creates a strategy/playbook. */
export const POST: APIRoute = async ({ request }) => {
	try {
		const session = await requireSession(request);
		const body = await request.json();
		const strategy = await settingsService.createStrategy(session.user.id, body);
		return jsonResponse(strategy, 201);
	} catch (error) {
		return errorResponse(error);
	}
};
