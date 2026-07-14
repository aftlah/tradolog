export class AppError extends Error {
	readonly code: string;
	readonly statusCode: number;
	readonly isOperational: boolean;

	constructor(message: string, code = 'APP_ERROR', statusCode = 400) {
		super(message);
		this.name = 'AppError';
		this.code = code;
		this.statusCode = statusCode;
		this.isOperational = true;
	}
}

export class AuthError extends AppError {
	constructor(message: string, code = 'AUTH_ERROR') {
		super(message, code, 401);
		this.name = 'AuthError';
	}
}

export class NotFoundError extends AppError {
	constructor(message = 'Resource not found.', code = 'NOT_FOUND') {
		super(message, code, 404);
		this.name = 'NotFoundError';
	}
}

export class ValidationError extends AppError {
	constructor(message: string, code = 'VALIDATION_ERROR') {
		super(message, code, 422);
		this.name = 'ValidationError';
	}
}

export class ForbiddenError extends AppError {
	constructor(message = 'You do not have access to this resource.', code = 'FORBIDDEN') {
		super(message, code, 403);
		this.name = 'ForbiddenError';
	}
}

export function toUserFacingAuthMessage(error: unknown): string {
	if (error instanceof AuthError || error instanceof AppError) {
		return error.message;
	}

	if (error instanceof Error && error.message.trim().length > 0) {
		const message = error.message.toLowerCase();

		if (message.includes('origin') || message.includes('csrf') || message.includes('forbidden')) {
			return 'Auth request was blocked. Restart the dev server and confirm BETTER_AUTH_URL matches this site (e.g. http://localhost:4321).';
		}

		if (message.includes('exists') || message.includes('already')) {
			return 'An account with this email already exists. Try signing in instead.';
		}

		if (message.includes('invalid email or password') || message.includes('invalid credentials')) {
			return 'Invalid email or password.';
		}

		if (message.includes('credential')) {
			return 'Invalid email or password.';
		}

		if (message.includes('password')) {
			return 'Unable to update password. Please try again.';
		}

		return 'Something went wrong. Please try again.';
	}

	return 'Something went wrong. Please try again.';
}
