import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse, requireSession } from '@shared/lib/api-response';
import { analyticsService } from '@features/analytics/services/analytics.service';

/**
 * Returns the analytics payload for the current session's user, scoped to `?accountId=`.
 * Used by the client-side account switcher to refresh stats without a full page reload.
 */
export const GET: APIRoute = async ({ request, url }) => {
	try {
		const session = await requireSession(request);
		const accountId = url.searchParams.get('accountId');
		const data = await analyticsService.getAnalyticsData(session.user.id, accountId);
		return jsonResponse(data);
	} catch (error) {
		return errorResponse(error);
	}
};
