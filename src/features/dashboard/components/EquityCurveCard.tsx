import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { formatCurrency, formatDate } from '@shared/utils/format';
import type { DashboardEquityPoint } from '../types/dashboard.types';

interface EquityCurveCardProps {
	equityCurve: DashboardEquityPoint[];
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
	const point = payload[0]?.payload as DashboardEquityPoint | undefined;
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

/** Renders the realized equity curve built by `TradingCalculatorService.equityCurve()`. */
export function EquityCurveCard({ equityCurve, startingBalance, currency }: EquityCurveCardProps) {
	const chartData =
		equityCurve.length > 0
			? equityCurve
			: [{ closedAt: new Date().toISOString(), equity: startingBalance, profitLoss: 0 }];

	return (
		<div className="glass-card flex h-full flex-col gap-4 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-sm font-medium text-muted">Equity Curve</h2>
					<p className="text-lg font-semibold tracking-tight text-foreground">Realized account growth</p>
				</div>
				<div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
					<TrendingUp className="size-4.5" aria-hidden="true" />
				</div>
			</div>

			{equityCurve.length === 0 ? (
				<p className="text-sm text-muted">No closed trades yet — the curve will fill in as trades close.</p>
			) : null}

			<div className="h-64 w-full" role="img" aria-label="Equity curve chart">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
						<defs>
							<linearGradient id="dashboardEquityFill" x1="0" y1="0" x2="0" y2="1">
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
						<YAxis
							hide
							domain={['dataMin - 100', 'dataMax + 100']}
						/>
						<Tooltip content={(props) => <EquityTooltip {...props} currency={currency} />} />
						<Area
							type="monotone"
							dataKey="equity"
							stroke="#2563EB"
							strokeWidth={2.5}
							fill="url(#dashboardEquityFill)"
							isAnimationActive
							animationDuration={600}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
