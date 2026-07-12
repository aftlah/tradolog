import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse, requireSession } from '@shared/lib/api-response';
import { settingsService } from '@features/settings/services/settings.service';

/** GET /api/settings/profile — the current user's trader-preferences profile. */
export const GET: APIRoute = async ({ request }) => {
	try {
		const session = await requireSession(request);
		const { profile } = await settingsService.getSettingsPageData(session.user.id);
		return jsonResponse(profile);
	} catch (error) {
		return errorResponse(error);
	}
};

/** PATCH /api/settings/profile — updates the current user's trader-preferences profile. */
export const PATCH: APIRoute = async ({ request }) => {
	try {
		const session = await requireSession(request);
		const body = await request.json();
		const profile = await settingsService.updateProfile(session.user.id, body);
		return jsonResponse(profile);
	} catch (error) {
		return errorResponse(error);
	}
};
