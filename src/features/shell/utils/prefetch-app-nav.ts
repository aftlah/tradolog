import { NAV_ITEMS } from '@shared/constants/nav.constants';

/**
 * Warm the ClientRouter document cache for primary nav routes after the first paint.
 * Soft navigations then hit the prefetched HTML instead of waiting on a cold SSR round-trip.
 */
export function scheduleAppNavPrefetch(currentPathname: string): () => void {
	let cancelled = false;
	let idleHandle: number | undefined;
	let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

	async function warm(): Promise<void> {
		try {
			const { prefetch } = await import('astro:prefetch');
			const targets = NAV_ITEMS.filter((item) => item.enabled).map((item) => item.href);

			for (const href of targets) {
				if (cancelled) {
					return;
				}
				const isCurrent =
					href === '/app'
						? currentPathname === '/app' || currentPathname === '/app/'
						: currentPathname === href || currentPathname.startsWith(`${href}/`);
				if (isCurrent) {
					continue;
				}
				prefetch(href);
				await new Promise((resolve) => setTimeout(resolve, 120));
			}
		} catch {
			// Prefetch is best-effort — soft nav still works without it.
		}
	}

	const start = () => {
		void warm();
	};

	if (typeof window.requestIdleCallback === 'function') {
		idleHandle = window.requestIdleCallback(start, { timeout: 1500 });
	} else {
		timeoutHandle = setTimeout(start, 600);
	}

	return () => {
		cancelled = true;
		if (idleHandle !== undefined && typeof window.cancelIdleCallback === 'function') {
			window.cancelIdleCallback(idleHandle);
		}
		if (timeoutHandle !== undefined) {
			clearTimeout(timeoutHandle);
		}
	};
}
