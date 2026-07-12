import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse, requireSession } from '@shared/lib/api-response';
import { ValidationError } from '@shared/lib/errors';
import { settingsService } from '@features/settings/services/settings.service';

/** PATCH /api/settings/accounts/:id — updates a trading account. */
export const PATCH: APIRoute = async ({ request, params }) => {
	try {
		const session = await requireSession(request);
		if (!params.id) {
			throw new ValidationError('Account id is required.');
		}
		const body = await request.json();
		const account = await settingsService.updateAccount(params.id, session.user.id, body);
		return jsonResponse(account);
	} catch (error) {
		return errorResponse(error);
	}
};

/** DELETE /api/settings/accounts/:id — soft-deletes a trading account. */
export const DELETE: APIRoute = async ({ request, params }) => {
	try {
		const session = await requireSession(request);
		if (!params.id) {
			throw new ValidationError('Account id is required.');
		}
		await settingsService.deleteAccount(params.id, session.user.id);
		return jsonResponse({ success: true });
	} catch (error) {
		return errorResponse(error);
	}
};
