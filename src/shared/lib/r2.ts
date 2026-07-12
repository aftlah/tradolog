/**
 * Cloudflare R2 storage lands with trade screenshots.
 * Database stores URLs only; uploads go through this module later.
 */
export type R2ObjectUrl = string;

export type R2UploadInput = {
	key: string;
	body: ArrayBuffer | Uint8Array | Blob;
	contentType: string;
};

export async function uploadTradeScreenshot(_input: R2UploadInput): Promise<R2ObjectUrl> {
	throw new Error('R2 storage is not configured yet. Implement in a later feature.');
}

export async function deleteTradeScreenshot(_key: string): Promise<void> {
	throw new Error('R2 storage is not configured yet. Implement in a later feature.');
}
