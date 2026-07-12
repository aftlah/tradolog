import { motion } from 'framer-motion';
import { AUTH_STATS, MOTION } from '@features/auth/constants/auth.constants';

export function FloatingStatCards() {
	return (
		<ul className="mt-6 grid gap-3 sm:grid-cols-3" aria-label="Sample performance statistics">
			{AUTH_STATS.map((stat, index) => (
				<motion.li
					key={stat.id}
					className="glass-panel px-4 py-3"
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: MOTION.duration, delay: 0.15 + index * 0.08, ease: MOTION.ease }}
					whileHover={{ y: -3 }}
				>
					<p className="text-xs tracking-wide text-muted uppercase">{stat.label}</p>
					<p className="mt-1 text-xl font-semibold text-foreground">{stat.value}</p>
					<p className="mt-1 text-xs text-success">{stat.delta}</p>
				</motion.li>
			))}
		</ul>
	);
}
