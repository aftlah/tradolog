import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse, requireSession } from '@shared/lib/api-response';
import { tradeJournalService } from '@features/trade/services/trade-journal.service';
import { ValidationError } from '@shared/lib/errors';

/** POST /api/trades/:id/images — multipart screenshot upload (multi-file supported). */
export const POST: APIRoute = async ({ request, params }) => {
	try {
		const session = await requireSession(request);
		if (!params.id) {
			throw new ValidationError('Trade id is required.');
		}

		const formData = await request.formData();
		const files = formData.getAll('files').filter((entry): entry is File => entry instanceof File);

		const images = await tradeJournalService.addImages(params.id, session.user.id, files);
		return jsonResponse({ images }, 201);
	} catch (error) {
		return errorResponse(error);
	}
};
