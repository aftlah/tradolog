import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse, requireSession } from '@shared/lib/api-response';
import { calendarService } from '@features/calendar/services/calendar.service';
import { parseCalendarQuery } from '@features/calendar/utils/query';

/**
 * Returns the calendar month heat-map for the current session's user, scoped to
 * `?year=&month=&accountId=`. Used by the client-side month navigation and account switcher to
 * refresh the grid without a full page reload.
 */
export const GET: APIRoute = async ({ request, url }) => {
	try {
		const session = await requireSession(request);
		const query = parseCalendarQuery(url.searchParams);
		const data = await calendarService.getCalendarData(session.user.id, query.year, query.month, query.accountId);
		return jsonResponse(data);
	} catch (error) {
		return errorResponse(error);
	}
};
