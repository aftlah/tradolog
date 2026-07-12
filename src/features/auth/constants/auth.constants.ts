export const AUTH_ROUTES = {
	login: '/login',
	register: '/register',
	forgotPassword: '/forgot-password',
	resetPassword: '/reset-password',
	appHome: '/app',
} as const;

export const AUTH_COPY = {
	brand: 'Tradolog',
	headlineLine1: 'Track Every Trade.',
	headlineLine2: 'Master Every Decision.',
	description:
		'A premium trading journal for recording, reviewing, and refining your edge — without executing a single trade.',
} as const;

export const AUTH_STATS = [
	{ id: 'win-rate', label: 'Win Rate', value: '62.4%', delta: '+4.1%' },
	{ id: 'profit-factor', label: 'Profit Factor', value: '1.87', delta: '+0.22' },
	{ id: 'monthly-return', label: 'Monthly Return', value: '12.6%', delta: '+2.8%' },
] as const;

/** Demo equity series for the marketing panel (illustrative only). */
export const AUTH_EQUITY_SERIES = [
	{ day: 'Mon', equity: 10_000 },
	{ day: 'Tue', equity: 10_240 },
	{ day: 'Wed', equity: 10_110 },
	{ day: 'Thu', equity: 10_480 },
	{ day: 'Fri', equity: 10_720 },
	{ day: 'Sat', equity: 10_650 },
	{ day: 'Sun', equity: 11_040 },
] as const;

export const MOTION = {
	duration: 0.25,
	ease: [0.22, 1, 0.36, 1] as const,
} as const;

export const PROTECTED_PATH_PREFIXES = ['/app'] as const;

export const GUEST_ONLY_PATHS = [
	AUTH_ROUTES.login,
	AUTH_ROUTES.register,
	AUTH_ROUTES.forgotPassword,
	AUTH_ROUTES.resetPassword,
] as const;
