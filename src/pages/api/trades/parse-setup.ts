import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse, requireSession } from '@shared/lib/api-response';
import { ValidationError } from '@shared/lib/errors';
import { setupParseService } from '@features/trade/services/setup-parse.service';
import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_SIZE_BYTES } from '@features/trade/constants/trade.constants';

/**
 * Transient setup-image parse. Image is read in memory only — never stored.
 * multipart field name: `image`
 */
export const POST: APIRoute = async ({ request }) => {
	try {
		const session = await requireSession(request);
		const contentType = request.headers.get('content-type') ?? '';
		if (!contentType.includes('multipart/form-data')) {
			throw new ValidationError('Expected multipart form data with an image field.');
		}

		const form = await request.formData();
		const file = form.get('image');
		if (!(file instanceof File)) {
			throw new ValidationError('Please choose a setup image.');
		}

		if (file.size <= 0 || file.size > MAX_IMAGE_SIZE_BYTES) {
			throw new ValidationError('Image must be under 5 MB.');
		}

		const mimeType = file.type || 'application/octet-stream';
		if (!(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType)) {
			throw new ValidationError('Use a PNG, JPEG, WebP, or GIF image.');
		}

		const bytes = new Uint8Array(await file.arrayBuffer());
		const patch = await setupParseService.parseImage(session.user.id, {
			bytes,
			mimeType,
			size: file.size,
		});

		return jsonResponse({ patch });
	} catch (error) {
		return errorResponse(error);
	}
};
