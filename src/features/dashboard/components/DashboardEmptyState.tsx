import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';

/** Shown when the signed-in user has no trading accounts yet. */
export function DashboardEmptyState() {
	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
			className="glass-card flex flex-col items-center gap-4 p-12 text-center"
		>
			<div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
				<Wallet className="size-6" aria-hidden="true" />
			</div>
			<div>
				<h2 className="text-xl font-semibold tracking-tight text-foreground">No trading accounts yet</h2>
				<p className="mx-auto mt-2 max-w-sm text-sm text-muted">
					Your dashboard will come alive as soon as you add a trading account and start logging trades.
					Account and trade management ship in the next features.
				</p>
			</div>
		</motion.div>
	);
}
