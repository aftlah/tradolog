import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse, requireSession } from '@shared/lib/api-response';
import { riskRulesService } from '@features/risk/services/risk-rules.service';

/** GET /api/settings/risk — standing risk rules for the signed-in user. */
export const GET: APIRoute = async ({ request }) => {
	try {
		const session = await requireSession(request);
		const rules = await riskRulesService.getDto(session.user.id);
		return jsonResponse(rules);
	} catch (error) {
		return errorResponse(error);
	}
};

/** PATCH /api/settings/risk — updates standing risk rules. */
export const PATCH: APIRoute = async ({ request }) => {
	try {
		const session = await requireSession(request);
		const body = await request.json();
		const rules = await riskRulesService.updateFromForm(session.user.id, body);
		return jsonResponse(rules);
	} catch (error) {
		return errorResponse(error);
	}
};
