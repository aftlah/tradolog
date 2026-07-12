import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button, type ButtonProps } from './button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog';

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	confirmLabel?: string;
	cancelLabel?: string;
	confirmVariant?: ButtonProps['variant'];
	onConfirm: () => Promise<void> | void;
}

/**
 * Generic destructive-action confirmation dialog (delete trade, delete image, etc). Owns its own
 * pending state so callers only need to provide an async `onConfirm`.
 */
export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel = 'Delete',
	cancelLabel = 'Cancel',
	confirmVariant = 'destructive',
	onConfirm,
}: ConfirmDialogProps) {
	const [isPending, setIsPending] = useState(false);

	async function handleConfirm() {
		setIsPending(true);
		try {
			await onConfirm();
			onOpenChange(false);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={(next) => (isPending ? null : onOpenChange(next))}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
						{cancelLabel}
					</Button>
					<Button type="button" variant={confirmVariant} onClick={handleConfirm} disabled={isPending} aria-busy={isPending}>
						{isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
						{confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
