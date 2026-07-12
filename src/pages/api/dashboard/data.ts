import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse, requireSession } from '@shared/lib/api-response';
import { dashboardService } from '@features/dashboard/services/dashboard.service';

/**
 * Returns the dashboard payload for the current session's user, scoped to `?accountId=`.
 * Used by the client-side account switcher to refresh stats without a full page reload.
 */
export const GET: APIRoute = async ({ request, url }) => {
	try {
		const session = await requireSession(request);
		const accountId = url.searchParams.get('accountId');
		const data = await dashboardService.getDashboardData(session.user.id, accountId);
		return jsonResponse(data);
	} catch (error) {
		return errorResponse(error);
	}
};
