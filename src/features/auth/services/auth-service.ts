import {
	authClient,
	requestPasswordReset,
	resetPassword,
	signIn,
	signOut,
	signUp,
} from '@shared/lib/auth-client';
import { AuthError, toUserFacingAuthMessage } from '@shared/lib/errors';
import { AUTH_ROUTES } from '@features/auth/constants/auth.constants';
import type {
	ForgotPasswordInput,
	LoginInput,
	RegisterInput,
	ResetPasswordInput,
} from '@features/auth/validators/auth-schemas';

function throwAuthError(error: unknown): never {
	if (
		error &&
		typeof error === 'object' &&
		'message' in error &&
		typeof (error as { message: unknown }).message === 'string'
	) {
		throw new AuthError(toUserFacingAuthMessage(new Error((error as { message: string }).message)));
	}

	throw new AuthError(toUserFacingAuthMessage(error));
}

export async function loginWithEmail(input: LoginInput): Promise<void> {
	const { error } = await signIn.email({
		email: input.email,
		password: input.password,
		rememberMe: input.rememberMe,
		callbackURL: AUTH_ROUTES.appHome,
	});

	if (error) {
		throwAuthError(error);
	}
}

export async function registerWithEmail(input: RegisterInput): Promise<void> {
	const { error } = await signUp.email({
		name: input.name,
		email: input.email,
		password: input.password,
		callbackURL: AUTH_ROUTES.appHome,
	});

	if (error) {
		throwAuthError(error);
	}
}

export async function loginWithGoogle(): Promise<void> {
	const { error } = await signIn.social({
		provider: 'google',
		callbackURL: AUTH_ROUTES.appHome,
	});

	if (error) {
		throwAuthError(error);
	}
}

export async function requestPasswordResetEmail(input: ForgotPasswordInput): Promise<void> {
	const { error } = await requestPasswordReset({
		email: input.email,
		redirectTo: `${window.location.origin}${AUTH_ROUTES.resetPassword}`,
	});

	if (error) {
		throwAuthError(error);
	}
}

export async function resetPasswordWithToken(
	input: ResetPasswordInput,
	token: string,
): Promise<void> {
	const { error } = await resetPassword({
		newPassword: input.password,
		token,
	});

	if (error) {
		throwAuthError(error);
	}
}

export async function logout(): Promise<void> {
	const { error } = await signOut();
	if (error) {
		throwAuthError(error);
	}
}

export { authClient };
