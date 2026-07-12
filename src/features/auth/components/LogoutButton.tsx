import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@shared/components';
import { logout } from '@features/auth/services/auth-service';
import { AUTH_ROUTES } from '@features/auth/constants/auth.constants';
import { toUserFacingAuthMessage } from '@shared/lib/errors';

type LogoutButtonProps = {
	className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
	const [loading, setLoading] = useState(false);

	async function handleLogout() {
		setLoading(true);
		try {
			await logout();
			toast.success('Signed out.');
			window.location.assign(AUTH_ROUTES.login);
		} catch (error) {
			toast.error(toUserFacingAuthMessage(error));
			setLoading(false);
		}
	}

	return (
		<Button
			type="button"
			variant="outline"
			className={className}
			disabled={loading}
			aria-busy={loading}
			onClick={handleLogout}
		>
			{loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
			Logout
		</Button>
	);
}
