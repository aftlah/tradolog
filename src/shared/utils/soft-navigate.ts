/**
 * Full page navigation.
 *
 * Soft ClientRouter transitions were removed — they repeatedly aborted in production
 * (`InvalidStateError`) when React islands hydrated, leaving users on a half-swapped page.
 */
export async function softNavigate(href: string): Promise<void> {
	window.location.assign(href);
}
