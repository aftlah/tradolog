/**
 * Cloudflare R2 storage (S3-compatible) for trade screenshots.
 *
 * The database only ever stores the resulting URL + storage key — binary bytes always live in
 * R2, never in PostgreSQL. Every function here is server-only (uses AWS SDK v3's S3 client
 * pointed at R2's S3-compatible endpoint) and throws a typed `AppError` when storage isn't
 * configured, so callers can surface a clean message instead of a raw SDK error.
 */
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { AppError } from '@shared/lib/errors';
import { getEnv } from '@shared/lib/env';

export type R2ObjectUrl = string;

export type R2UploadInput = {
	key: string;
	body: ArrayBuffer | Uint8Array | Blob;
	contentType: string;
};

export type R2UploadResult = {
	url: R2ObjectUrl;
	key: string;
};

export class StorageNotConfiguredError extends AppError {
	constructor() {
		super('File storage is not configured. Set the R2_* environment variables.', 'STORAGE_NOT_CONFIGURED', 503);
		this.name = 'StorageNotConfiguredError';
	}
}

let cachedClient: S3Client | null = null;

function getR2Client(): S3Client {
	if (cachedClient) {
		return cachedClient;
	}

	const env = getEnv();
	const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = env;

	if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
		throw new StorageNotConfiguredError();
	}

	cachedClient = new S3Client({
		region: 'auto',
		endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId: R2_ACCESS_KEY_ID,
			secretAccessKey: R2_SECRET_ACCESS_KEY,
		},
	});

	return cachedClient;
}

function getBucketName(): string {
	const bucket = getEnv().R2_BUCKET_NAME;
	if (!bucket) {
		throw new StorageNotConfiguredError();
	}
	return bucket;
}

function getPublicUrlBase(): string {
	const base = getEnv().R2_PUBLIC_URL;
	if (!base) {
		throw new StorageNotConfiguredError();
	}
	return base.endsWith('/') ? base.slice(0, -1) : base;
}

async function toUint8Array(body: R2UploadInput['body']): Promise<Uint8Array> {
	if (body instanceof Uint8Array) {
		return body;
	}
	if (body instanceof Blob) {
		return new Uint8Array(await body.arrayBuffer());
	}
	return new Uint8Array(body);
}

/** Uploads a single object to the trade-screenshots bucket and returns its public URL + key. */
export async function uploadTradeScreenshot(input: R2UploadInput): Promise<R2UploadResult> {
	const client = getR2Client();
	const bucket = getBucketName();

	await client.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: input.key,
			Body: await toUint8Array(input.body),
			ContentType: input.contentType,
		}),
	);

	return {
		url: `${getPublicUrlBase()}/${input.key}`,
		key: input.key,
	};
}

export async function deleteTradeScreenshot(key: string): Promise<void> {
	const client = getR2Client();
	const bucket = getBucketName();

	await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

/** Returns `true` when R2 credentials are present, without throwing. Useful for feature gating. */
export function isStorageConfigured(): boolean {
	const env = getEnv();
	return Boolean(env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_BUCKET_NAME && env.R2_PUBLIC_URL);
}
