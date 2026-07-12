import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
	return (
		<SonnerToaster
			theme="dark"
			position="top-right"
			toastOptions={{
				classNames: {
					toast:
						'glass-card !border-white/10 !bg-surface/90 !text-foreground !backdrop-blur-2xl',
					title: '!text-foreground',
					description: '!text-muted',
					actionButton: '!bg-primary !text-primary-foreground',
					cancelButton: '!bg-white/10 !text-foreground',
					error: '!border-danger/40',
					success: '!border-success/40',
				},
			}}
		/>
	);
}
