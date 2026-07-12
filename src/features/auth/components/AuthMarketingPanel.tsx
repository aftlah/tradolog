import { motion } from 'framer-motion';
import { AUTH_COPY, MOTION } from '@features/auth/constants/auth.constants';
import { EquityCurveChart } from '@features/auth/components/EquityCurveChart';
import { FloatingStatCards } from '@features/auth/components/FloatingStatCards';

export function AuthMarketingPanel() {
	return (
		<section className="relative flex h-full flex-col justify-between overflow-hidden px-8 py-10 lg:px-12 lg:py-14">
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgb(37_99_235_/_0.22),_transparent_50%),radial-gradient(ellipse_at_bottom,_rgb(24_24_27_/_0.9),_#09090b_70%)]"
			/>

			<div className="relative z-10">
				<motion.p
					className="text-sm font-medium tracking-[0.22em] text-muted uppercase"
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: MOTION.duration, ease: MOTION.ease }}
				>
					{AUTH_COPY.brand}
				</motion.p>

				<motion.h1
					className="mt-8 max-w-lg text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]"
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: MOTION.duration, delay: 0.05, ease: MOTION.ease }}
				>
					{AUTH_COPY.headlineLine1}
					<br />
					{AUTH_COPY.headlineLine2}
				</motion.h1>

				<motion.p
					className="mt-5 max-w-md text-base text-muted md:text-lg"
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: MOTION.duration, delay: 0.1, ease: MOTION.ease }}
				>
					{AUTH_COPY.description}
				</motion.p>
			</div>

			<div className="relative z-10 mt-10">
				<motion.div
					className="glass-panel p-4"
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: MOTION.duration, delay: 0.12, ease: MOTION.ease }}
				>
					<p className="mb-2 text-xs tracking-wide text-muted uppercase">Equity curve</p>
					<EquityCurveChart />
				</motion.div>
				<FloatingStatCards />
			</div>
		</section>
	);
}
