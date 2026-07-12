import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse, requireSession } from '@shared/lib/api-response';
import { ValidationError } from '@shared/lib/errors';
import { settingsService } from '@features/settings/services/settings.service';

/** PATCH /api/settings/symbols/:id — updates a user-owned custom symbol. */
export const PATCH: APIRoute = async ({ request, params }) => {
	try {
		const session = await requireSession(request);
		if (!params.id) {
			throw new ValidationError('Symbol id is required.');
		}
		const body = await request.json();
		const symbol = await settingsService.updateSymbol(params.id, session.user.id, body);
		return jsonResponse(symbol);
	} catch (error) {
		return errorResponse(error);
	}
};

/** DELETE /api/settings/symbols/:id — soft-deletes a user-owned custom symbol. */
export const DELETE: APIRoute = async ({ request, params }) => {
	try {
		const session = await requireSession(request);
		if (!params.id) {
			throw new ValidationError('Symbol id is required.');
		}
		await settingsService.deleteSymbol(params.id, session.user.id);
		return jsonResponse({ success: true });
	} catch (error) {
		return errorResponse(error);
	}
};
