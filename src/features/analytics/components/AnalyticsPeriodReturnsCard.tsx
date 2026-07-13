import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CalendarRange } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components';
import { formatDate, formatSignedCurrency, formatSignedPercent } from '@shared/utils/format';
import type { AnalyticsPeriodReturn, AnalyticsPeriodReturns } from '../types/analytics.types';

interface AnalyticsPeriodReturnsCardProps {
	periodReturns: AnalyticsPeriodReturns;
	currency: string;
}

interface TooltipPayloadItem {
	payload?: unknown;
}

function ReturnsTooltip({
	active,
	payload,
	currency,
}: {
	active?: boolean;
	payload?: readonly TooltipPayloadItem[];
	currency: string;
}) {
	if (!active || !payload?.length) {
		return null;
	}
	const point = payload[0]?.payload as AnalyticsPeriodReturn | undefined;
	if (!point) {
		return null;
	}
	return (
		<div className="rounded-xl border border-white/10 bg-[#18181b]/95 px-3 py-2 text-xs shadow-glass">
			<p className="text-muted">{formatDate(point.periodStart)}</p>
			<p className={`mt-1 font-semibold ${point.profitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
				{formatSignedCurrency(point.profitLoss, currency)}
			</p>
			{point.returnPercent !== null ? (
				<p className="text-muted">{formatSignedPercent(point.returnPercent)}</p>
			) : null}
			<p className="text-muted">
				{point.tradeCount} trade{point.tradeCount === 1 ? '' : 's'}
			</p>
		</div>
	);
}

interface ReturnsBarChartProps {
	data: AnalyticsPeriodReturn[];
	currency: string;
	tickFormat: Intl.DateTimeFormatOptions;
	emptyLabel: string;
}

const CHART_HEIGHT = 256;

function ReturnsBarChart({ data, currency, tickFormat, emptyLabel }: ReturnsBarChartProps) {
	if (data.length === 0) {
		return <p className="py-10 text-center text-sm text-muted">{emptyLabel}</p>;
	}

	return (
		<div className="w-full min-w-0" style={{ height: CHART_HEIGHT }} role="img" aria-label="Period returns chart">
			<ResponsiveContainer
				width="100%"
				height={CHART_HEIGHT}
				minWidth={0}
				initialDimension={{ width: 640, height: CHART_HEIGHT }}
			>
				<BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
					<CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
					<XAxis
						dataKey="periodStart"
						tickFormatter={(value: string) => formatDate(value, tickFormat)}
						stroke="rgba(255,255,255,0.3)"
						fontSize={11}
						tickLine={false}
						axisLine={false}
						minTickGap={24}
					/>
					<YAxis hide />
					<Tooltip content={(props) => <ReturnsTooltip {...props} currency={currency} />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
					<Bar dataKey="profitLoss" radius={[6, 6, 6, 6]} maxBarSize={28} isAnimationActive={false}>
						{data.map((entry) => (
							<Cell key={entry.periodKey} fill={entry.profitLoss >= 0 ? '#22C55E' : '#EF4444'} />
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}

/** Daily / weekly / monthly realized return breakdown, sourced from `TradingCalculatorService.periodReturns()`. */
export function AnalyticsPeriodReturnsCard({ periodReturns, currency }: AnalyticsPeriodReturnsCardProps) {
	return (
		<div className="glass-card flex flex-col gap-4 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-sm font-medium text-muted">Period Returns</h2>
					<p className="text-lg font-semibold tracking-tight text-foreground">P&L by timeframe</p>
				</div>
				<div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
					<CalendarRange className="size-4.5" aria-hidden="true" />
				</div>
			</div>

			<Tabs defaultValue="daily">
				<TabsList>
					<TabsTrigger value="daily">Daily</TabsTrigger>
					<TabsTrigger value="weekly">Weekly</TabsTrigger>
					<TabsTrigger value="monthly">Monthly</TabsTrigger>
				</TabsList>
				<TabsContent value="daily" forceMount className="data-[state=inactive]:hidden">
					<ReturnsBarChart
						data={periodReturns.daily}
						currency={currency}
						tickFormat={{ month: 'short', day: 'numeric' }}
						emptyLabel="No daily returns yet — closed trades will appear here by day."
					/>
				</TabsContent>
				<TabsContent value="weekly" forceMount className="data-[state=inactive]:hidden">
					<ReturnsBarChart
						data={periodReturns.weekly}
						currency={currency}
						tickFormat={{ month: 'short', day: 'numeric' }}
						emptyLabel="No weekly returns yet — closed trades will appear here by week."
					/>
				</TabsContent>
				<TabsContent value="monthly" forceMount className="data-[state=inactive]:hidden">
					<ReturnsBarChart
						data={periodReturns.monthly}
						currency={currency}
						tickFormat={{ month: 'short', year: '2-digit' }}
						emptyLabel="No monthly returns yet — closed trades will appear here by month."
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
