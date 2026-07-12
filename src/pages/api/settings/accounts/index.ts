import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse, requireSession } from '@shared/lib/api-response';
import { settingsService } from '@features/settings/services/settings.service';

/** GET /api/settings/accounts — the current user's trading accounts. */
export const GET: APIRoute = async ({ request }) => {
	try {
		const session = await requireSession(request);
		const { accounts } = await settingsService.getSettingsPageData(session.user.id);
		return jsonResponse(accounts);
	} catch (error) {
		return errorResponse(error);
	}
};

/** POST /api/settings/accounts — creates a trading account. */
export const POST: APIRoute = async ({ request }) => {
	try {
		const session = await requireSession(request);
		const body = await request.json();
		const account = await settingsService.createAccount(session.user.id, body);
		return jsonResponse(account, 201);
	} catch (error) {
		return errorResponse(error);
	}
};
