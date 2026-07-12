import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse, requireSession } from '@shared/lib/api-response';
import { calendarService } from '@features/calendar/services/calendar.service';
import { parseCalendarQuery } from '@features/calendar/utils/query';

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
