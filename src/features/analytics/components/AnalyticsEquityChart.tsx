import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { formatCurrency, formatDate } from '@shared/utils/format';
import type { AnalyticsEquityPoint } from '../types/analytics.types';

interface AnalyticsEquityChartProps {
	equityCurve: AnalyticsEquityPoint[];
	startingBalance: number;
	currency: string;
}

interface TooltipPayloadItem {
	payload?: unknown;
}

function EquityTooltip({
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
	const point = payload[0]?.payload as AnalyticsEquityPoint | undefined;
	if (!point) {
		return null;
	}
	return (
		<div className="rounded-xl border border-white/10 bg-[#18181b]/95 px-3 py-2 text-xs shadow-glass">
			<p className="text-muted">{formatDate(point.closedAt)}</p>
			<p className="mt-1 font-semibold text-foreground">{formatCurrency(point.equity, currency)}</p>
		</div>
	);
}

const CHART_HEIGHT = 288;

/** Full-history realized equity curve, built by `TradingCalculatorService.equityCurve()`. */
export function AnalyticsEquityChart({ equityCurve, startingBalance, currency }: AnalyticsEquityChartProps) {
	// Stable placeholder — never use `new Date()` here (SSR vs client → hydration #418).
	const chartData =
		equityCurve.length > 0
			? equityCurve
			: [{ closedAt: '1970-01-01T00:00:00.000Z', equity: startingBalance, profitLoss: 0 }];

	return (
		<div className="glass-card flex h-full min-w-0 flex-col gap-4 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-sm font-medium text-muted">Equity Curve</h2>
					<p className="text-lg font-semibold tracking-tight text-foreground">Full realized history</p>
				</div>
				<div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
					<TrendingUp className="size-4.5" aria-hidden="true" />
				</div>
			</div>

			{equityCurve.length === 0 ? (
				<p className="text-sm text-muted">No closed trades yet — the curve will fill in as trades close.</p>
			) : null}

			<div className="w-full min-w-0" style={{ height: CHART_HEIGHT }} role="img" aria-label="Equity curve chart">
				<ResponsiveContainer
					width="100%"
					height={CHART_HEIGHT}
					minWidth={0}
					initialDimension={{ width: 640, height: CHART_HEIGHT }}
				>
					<AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
						<defs>
							<linearGradient id="analyticsEquityFill" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="#2563EB" stopOpacity={0.4} />
								<stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
						<XAxis
							dataKey="closedAt"
							tickFormatter={(value: string) => formatDate(value, { month: 'short', day: 'numeric' })}
							stroke="rgba(255,255,255,0.3)"
							fontSize={11}
							tickLine={false}
							axisLine={false}
							minTickGap={32}
						/>
						<YAxis hide domain={['auto', 'auto']} />
						<Tooltip content={(props) => <EquityTooltip {...props} currency={currency} />} />
						<Area
							type="monotone"
							dataKey="equity"
							stroke="#818cf8"
							strokeWidth={2.5}
							fill="url(#analyticsEquityFill)"
							isAnimationActive={false}
							dot={false}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
