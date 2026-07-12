import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@shared/components';
import { AuthMarketingPanel } from '@features/auth/components/AuthMarketingPanel';
import { MOTION } from '@features/auth/constants/auth.constants';

type AuthSplitShellProps = {
	title: string;
	subtitle: string;
	children: ReactNode;
};

export function AuthSplitShell({ title, subtitle, children }: AuthSplitShellProps) {
	return (
		<div className="flex min-h-dvh w-full bg-background">
			<aside className="relative hidden w-[45%] border-r border-white/10 lg:block">
				<AuthMarketingPanel />
			</aside>

			<main className="relative flex w-full flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:w-[55%]">
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgb(37_99_235_/_0.12),_transparent_55%)]"
				/>

				<motion.div
					className="relative z-10 w-full max-w-md"
					initial={{ opacity: 0, y: 14 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: MOTION.duration, ease: MOTION.ease }}
				>
					<div className="mb-8 lg:hidden">
						<p className="text-sm font-medium tracking-[0.22em] text-muted uppercase">Tradolog</p>
						<h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
							Track Every Trade.
							<br />
							Master Every Decision.
						</h1>
					</div>

					<GlassCard>
						<header className="mb-6 space-y-2">
							<h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
							<p className="text-sm text-muted">{subtitle}</p>
						</header>
						{children}
					</GlassCard>
				</motion.div>
			</main>
		</div>
	);
}
