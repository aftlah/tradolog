export const SIDEBAR_EXPANDED_WIDTH = 256;
export const SIDEBAR_COLLAPSED_WIDTH = 72;

/** Shared spring for sidebar width + content offset — soft, no bounce. */
export const sidebarTransition = {
	type: 'spring' as const,
	stiffness: 320,
	damping: 36,
	mass: 0.85,
};

/** Faster opacity for labels so text doesn’t linger while width moves. */
export const sidebarLabelTransition = {
	duration: 0.2,
	ease: [0.22, 1, 0.36, 1] as const,
};
