import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse, requireSession } from '@shared/lib/api-response';
import { settingsService } from '@features/settings/services/settings.service';

/** GET /api/settings/symbols — symbols visible to the current user (system catalog + own). */
export const GET: APIRoute = async ({ request }) => {
	try {
		const session = await requireSession(request);
		const { symbols } = await settingsService.getSettingsPageData(session.user.id);
		return jsonResponse(symbols);
	} catch (error) {
		return errorResponse(error);
	}
};

/** POST /api/settings/symbols — creates a user-owned custom symbol. */
export const POST: APIRoute = async ({ request }) => {
	try {
		const session = await requireSession(request);
		const body = await request.json();
		const symbol = await settingsService.createSymbol(session.user.id, body);
		return jsonResponse(symbol, 201);
	} catch (error) {
		return errorResponse(error);
	}
};
