import type { ReactNode } from 'react';
import { DialogTitle } from '@shared/components';

/**
 * Radix `Dialog`/`AlertDialog` content requires a `Title` for screen-reader users. Some of our
 * dialogs (mobile nav, quick actions) don't need a visible heading, so this renders the
 * required title off-screen instead of skipping it.
 */
export function VisuallyHiddenTitle({ children }: { children: ReactNode }) {
	return <DialogTitle className="sr-only">{children}</DialogTitle>;
}
