import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse, requireSession } from '@shared/lib/api-response';
import { ValidationError } from '@shared/lib/errors';
import { settingsService } from '@features/settings/services/settings.service';

/** PATCH /api/settings/strategies/:id — updates a strategy/playbook. */
export const PATCH: APIRoute = async ({ request, params }) => {
	try {
		const session = await requireSession(request);
		if (!params.id) {
			throw new ValidationError('Strategy id is required.');
		}
		const body = await request.json();
		const strategy = await settingsService.updateStrategy(params.id, session.user.id, body);
		return jsonResponse(strategy);
	} catch (error) {
		return errorResponse(error);
	}
};

/** DELETE /api/settings/strategies/:id — soft-deletes a strategy/playbook. */
export const DELETE: APIRoute = async ({ request, params }) => {
	try {
		const session = await requireSession(request);
		if (!params.id) {
			throw new ValidationError('Strategy id is required.');
		}
		await settingsService.deleteStrategy(params.id, session.user.id);
		return jsonResponse({ success: true });
	} catch (error) {
		return errorResponse(error);
	}
};
