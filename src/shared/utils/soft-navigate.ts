/**
 * Full page navigation.
 *
 * Soft ClientRouter transitions were removed — they repeatedly aborted in production
 * (`InvalidStateError`) when React islands hydrated, leaving users on a half-swapped page.
 */
export async function softNavigate(href: string): Promise<void> {
	const bar = document.getElementById('nav-progress');
	if (bar) {
		bar.style.transition = 'none';
		bar.style.opacity = '1';
		bar.style.transform = 'scaleX(0.12)';
		requestAnimationFrame(() => {
			bar.style.transition = 'transform 8s cubic-bezier(0.1, 0.4, 0.2, 1)';
			bar.style.transform = 'scaleX(0.82)';
		});
	}
	window.location.assign(href);
}
