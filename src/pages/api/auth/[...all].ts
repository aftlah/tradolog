import type { APIRoute } from 'astro';
import { getAuth } from '@shared/lib/auth';

export const ALL: APIRoute = async (context) => {
	return getAuth().handler(context.request);
};

export const GET = ALL;
export const POST = ALL;
