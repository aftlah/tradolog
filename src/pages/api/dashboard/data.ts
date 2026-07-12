import type { APIRoute } from 'astro';
import { getAuth } from '@shared/lib/auth';
import { dashboardService } from '@features/dashboard/services/dashboard.service';

/**
 * Returns the dashboard payload for the current session's user, scoped to `?accountId=`.
 * Used by the client-side account switcher to refresh stats without a full page reload.
 */
export const GET: APIRoute = async ({ request, url }) => {
	const session = await getAuth().api.getSession({ headers: request.headers });

	if (!session) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const accountId = url.searchParams.get('accountId');

	try {
		const data = await dashboardService.getDashboardData(session.user.id, accountId);
		return new Response(JSON.stringify(data), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch {
		return new Response(JSON.stringify({ error: 'Failed to load dashboard data.' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
