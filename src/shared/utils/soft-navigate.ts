/**
 * Prefer Astro ClientRouter soft navigation when available; fall back to a full load.
 * Keeps post-mutation redirects from wiping the whole JS bundle on every save.
 *
 * Aborted view transitions (often after a hydration error) throw InvalidStateError —
 * always degrade to a hard navigation so the user is never stuck.
 */
export async function softNavigate(href: string): Promise<void> {
	try {
		const { navigate } = await import('astro:transitions/client');
		await navigate(href);
	} catch {
		window.location.assign(href);
	}
}
