import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { Skeleton } from '@shared/components';
import type {
	AnalyticsDrawdownSummary,
	AnalyticsEquityPoint,
	AnalyticsPeriodReturns,
} from '../types/analytics.types';

function ChartSuspense({ children, className }: { children: ReactNode; className: string }) {
	return (
		<Suspense fallback={<Skeleton className={`w-full rounded-3xl ${className}`} />}>
			{children}
		</Suspense>
	);
}

function lazyNamed<TProps extends object>(
	loader: () => Promise<Record<string, ComponentType<TProps>>>,
	exportName: string,
) {
	return lazy(async () => {
		const module = await loader();
		const Component = module[exportName];
		if (!Component) {
			throw new Error(`Missing export "${exportName}"`);
		}
		return { default: Component };
	});
}

const AnalyticsEquityChart = lazyNamed<EquityProps>(() => import('./AnalyticsEquityChart'), 'AnalyticsEquityChart');
const AnalyticsPeriodReturnsCard = lazyNamed<PeriodProps>(
	() => import('./AnalyticsPeriodReturnsCard'),
	'AnalyticsPeriodReturnsCard',
);
const AnalyticsDrawdownCard = lazyNamed<DrawdownProps>(() => import('./AnalyticsDrawdownCard'), 'AnalyticsDrawdownCard');

interface EquityProps {
	equityCurve: AnalyticsEquityPoint[];
	startingBalance: number;
	currency: string;
}

interface PeriodProps {
	periodReturns: AnalyticsPeriodReturns;
	currency: string;
}

interface DrawdownProps {
	drawdown: AnalyticsDrawdownSummary;
	currency: string;
}

/** Defers Recharts chart islands until after the analytics shell paints. */
export function LazyAnalyticsEquityChart(props: EquityProps) {
	return (
		<ChartSuspense className="h-72">
			<AnalyticsEquityChart {...props} />
		</ChartSuspense>
	);
}

export function LazyAnalyticsPeriodReturnsCard(props: PeriodProps) {
	return (
		<ChartSuspense className="h-80">
			<AnalyticsPeriodReturnsCard {...props} />
		</ChartSuspense>
	);
}

export function LazyAnalyticsDrawdownCard(props: DrawdownProps) {
	return (
		<ChartSuspense className="h-72">
			<AnalyticsDrawdownCard {...props} />
		</ChartSuspense>
	);
}
