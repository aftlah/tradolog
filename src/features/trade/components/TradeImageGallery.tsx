import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { ImagePlus, Loader2, Trash2, X } from 'lucide-react';
import { Button, ConfirmDialog, Dialog, DialogContent, VisuallyHiddenTitle } from '@shared/components';
import {
	ALLOWED_IMAGE_MIME_TYPES,
	MAX_IMAGES_PER_TRADE,
	MAX_IMAGE_SIZE_BYTES,
	TRADES_API_ROUTE,
} from '../constants/trade.constants';
import type { TradeImageDto } from '../types/trade.types';

interface TradeImageGalleryProps {
	tradeId: string;
	images: TradeImageDto[];
	onImagesChange: (images: TradeImageDto[]) => void;
}

/** Multi-image screenshot uploader + gallery/lightbox for a trade, backed by Cloudflare R2. */
export function TradeImageGallery({ tradeId, images, onImagesChange }: TradeImageGalleryProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
	const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

	async function handleFilesSelected(files: FileList | null) {
		if (!files || files.length === 0) {
			return;
		}

		if (images.length + files.length > MAX_IMAGES_PER_TRADE) {
			toast.error(`A trade can have at most ${MAX_IMAGES_PER_TRADE} screenshots.`);
			return;
		}

		for (const file of Array.from(files)) {
			if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
				toast.error(`"${file.name}" is not a supported image type.`);
				return;
			}
			if (file.size > MAX_IMAGE_SIZE_BYTES) {
				toast.error(`"${file.name}" exceeds the ${Math.round(MAX_IMAGE_SIZE_BYTES / (1024 * 1024))}MB limit.`);
				return;
			}
		}

		const formData = new FormData();
		for (const file of Array.from(files)) {
			formData.append('files', file);
		}

		setIsUploading(true);
		try {
			const response = await fetch(`${TRADES_API_ROUTE}/${tradeId}/images`, { method: 'POST', body: formData });
			if (!response.ok) {
				const payload = await response.json().catch(() => null);
				throw new Error(payload?.error ?? 'Could not upload screenshots.');
			}
			const { images: uploaded } = (await response.json()) as { images: TradeImageDto[] };
			onImagesChange([...images, ...uploaded]);
			toast.success(uploaded.length > 1 ? `${uploaded.length} screenshots uploaded.` : 'Screenshot uploaded.');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Could not upload screenshots.');
		} finally {
			setIsUploading(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		}
	}

	async function handleDelete(imageId: string) {
		const response = await fetch(`${TRADES_API_ROUTE}/${tradeId}/images/${imageId}`, { method: 'DELETE' });
		if (!response.ok) {
			toast.error('Could not delete this screenshot.');
			return;
		}
		onImagesChange(images.filter((image) => image.id !== imageId));
		toast.success('Screenshot deleted.');
	}

	return (
		<div className="glass-card p-6">
			<div className="mb-4 flex items-center justify-between">
				<div>
					<h2 className="text-sm font-medium text-muted">Screenshots</h2>
					<p className="text-xs text-muted">
						{images.length} / {MAX_IMAGES_PER_TRADE}
					</p>
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="gap-1.5"
					disabled={isUploading || images.length >= MAX_IMAGES_PER_TRADE}
					onClick={() => fileInputRef.current?.click()}
				>
					{isUploading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <ImagePlus className="size-4" aria-hidden="true" />}
					Upload
				</Button>
				<input
					ref={fileInputRef}
					type="file"
					accept={ALLOWED_IMAGE_MIME_TYPES.join(',')}
					multiple
					className="hidden"
					onChange={(event) => void handleFilesSelected(event.target.files)}
				/>
			</div>

			{images.length === 0 ? (
				<p className="py-8 text-center text-sm text-muted">No screenshots yet. Upload your chart or execution screenshots.</p>
			) : (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
					{images.map((image, index) => (
						<div key={image.id} className="group relative aspect-video overflow-hidden rounded-xl border border-white/8">
							<button
								type="button"
								className="size-full"
								onClick={() => setLightboxIndex(index)}
								aria-label={image.caption ?? 'View screenshot'}
							>
								<img src={image.url} alt={image.caption ?? 'Trade screenshot'} className="size-full object-cover" />
							</button>
							<button
								type="button"
								onClick={() => setPendingDeleteId(image.id)}
								className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-lg bg-black/60 text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100"
								aria-label="Delete screenshot"
							>
								<Trash2 className="size-3.5" aria-hidden="true" />
							</button>
						</div>
					))}
				</div>
			)}

			<Dialog open={lightboxIndex !== null} onOpenChange={(open) => !open && setLightboxIndex(null)}>
				<DialogContent showClose={false} className="max-w-4xl border-none bg-transparent p-0 shadow-none">
					<VisuallyHiddenTitle>Screenshot preview</VisuallyHiddenTitle>
					{lightboxIndex !== null ? (
						<div className="relative">
							<img
								src={images[lightboxIndex]?.url}
								alt={images[lightboxIndex]?.caption ?? 'Trade screenshot'}
								className="max-h-[80vh] w-full rounded-2xl object-contain"
							/>
							<button
								type="button"
								onClick={() => setLightboxIndex(null)}
								className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-xl bg-black/60 text-white backdrop-blur-md"
								aria-label="Close preview"
							>
								<X className="size-4" aria-hidden="true" />
							</button>
							{images.length > 1 ? (
								<div className="mt-3 flex items-center justify-center gap-2">
									{images.map((_, index) => (
										<button
											key={index}
											type="button"
											onClick={() => setLightboxIndex(index)}
											aria-label={`Go to screenshot ${index + 1}`}
											className={index === lightboxIndex ? 'size-2 rounded-full bg-primary' : 'size-2 rounded-full bg-white/30'}
										/>
									))}
								</div>
							) : null}
						</div>
					) : null}
				</DialogContent>
			</Dialog>

			<ConfirmDialog
				open={pendingDeleteId !== null}
				onOpenChange={(open) => !open && setPendingDeleteId(null)}
				title="Delete this screenshot?"
				description="This removes the screenshot from storage. This action cannot be undone."
				onConfirm={() => {
					if (pendingDeleteId) {
						return handleDelete(pendingDeleteId);
					}
				}}
			/>
		</div>
	);
}
