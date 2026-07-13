import { lazy, Suspense } from 'react';
import { Skeleton } from '@shared/components';
import type { DashboardEquityPoint } from '../types/dashboard.types';

const EquityCurveCard = lazy(() =>
	import('./EquityCurveCard').then((module) => ({ default: module.EquityCurveCard })),
);

interface LazyEquityCurveCardProps {
	equityCurve: DashboardEquityPoint[];
	startingBalance: number;
	currency: string;
}

/** Defers Recharts until after the dashboard shell paints. */
export function LazyEquityCurveCard(props: LazyEquityCurveCardProps) {
	return (
		<div className="h-full min-h-72">
			<Suspense fallback={<Skeleton className="h-full min-h-72 w-full rounded-3xl" />}>
				<EquityCurveCard {...props} />
			</Suspense>
		</div>
	);
}
