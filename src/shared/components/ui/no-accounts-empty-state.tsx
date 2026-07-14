import { Wallet } from 'lucide-react';

interface NoAccountsEmptyStateProps {
	description: string;
}

/** Shown across every feature page when the signed-in user has no trading accounts yet. */
export function NoAccountsEmptyState({ description }: NoAccountsEmptyStateProps) {
	return (
		<div className="glass-card flex animate-[fade-up_250ms_ease-out] flex-col items-center gap-4 p-12 text-center">
			<div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
				<Wallet className="size-6" aria-hidden="true" />
			</div>
			<div>
				<h2 className="text-xl font-semibold tracking-tight text-foreground">No trading accounts yet</h2>
				<p className="mx-auto mt-2 max-w-sm text-sm text-muted">{description}</p>
			</div>
		</div>
	);
}
