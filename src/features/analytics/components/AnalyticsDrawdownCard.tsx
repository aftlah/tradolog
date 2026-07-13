import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ShieldAlert } from 'lucide-react';
import { formatCurrency, formatDate, formatPercent } from '@shared/utils/format';
import type { AnalyticsDrawdownPoint, AnalyticsDrawdownSummary } from '../types/analytics.types';

interface AnalyticsDrawdownCardProps {
	drawdown: AnalyticsDrawdownSummary;
	currency: string;
}

interface TooltipPayloadItem {
	payload?: unknown;
}

function DrawdownTooltip({
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
	const point = payload[0]?.payload as AnalyticsDrawdownPoint | undefined;
	if (!point) {
		return null;
	}
	return (
		<div className="rounded-xl border border-white/10 bg-[#18181b]/95 px-3 py-2 text-xs shadow-glass">
			<p className="text-muted">{formatDate(point.closedAt)}</p>
			<p className="mt-1 font-semibold text-danger">
				-{formatCurrency(point.drawdown, currency)} ({formatPercent(point.drawdownPercent)})
			</p>
		</div>
	);
}

interface DrawdownStatProps {
	label: string;
	amount: string;
	percent: string;
}

function DrawdownStat({ label, amount, percent }: DrawdownStatProps) {
	return (
		<div className="flex flex-col gap-1 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
			<span className="text-xs font-medium text-muted">{label}</span>
			<span className="text-xl font-semibold tracking-tight text-danger">{amount}</span>
			<span className="text-xs font-medium text-muted">{percent}</span>
		</div>
	);
}

const CHART_HEIGHT = 192;

/** Peak-to-trough drawdown history, sourced from `TradingCalculatorService.drawdown()`. */
export function AnalyticsDrawdownCard({ drawdown, currency }: AnalyticsDrawdownCardProps) {
	const chartData = drawdown.points.length > 0 ? drawdown.points : [];

	return (
		<div className="glass-card flex h-full min-w-0 flex-col gap-4 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-sm font-medium text-muted">Drawdown</h2>
					<p className="text-lg font-semibold tracking-tight text-foreground">Peak-to-trough risk</p>
				</div>
				<div className="flex size-9 items-center justify-center rounded-xl bg-danger/10 text-danger">
					<ShieldAlert className="size-4.5" aria-hidden="true" />
				</div>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<DrawdownStat
					label="Current Drawdown"
					amount={formatCurrency(drawdown.currentDrawdown, currency)}
					percent={formatPercent(drawdown.currentDrawdownPercent)}
				/>
				<DrawdownStat
					label="Max Drawdown"
					amount={formatCurrency(drawdown.maxDrawdown, currency)}
					percent={formatPercent(drawdown.maxDrawdownPercent)}
				/>
			</div>

			{chartData.length === 0 ? (
				<p className="text-sm text-muted">No closed trades yet — drawdown will appear once trades close.</p>
			) : (
				<div className="w-full min-w-0" style={{ height: CHART_HEIGHT }} role="img" aria-label="Drawdown chart">
					<ResponsiveContainer
						width="100%"
						height={CHART_HEIGHT}
						minWidth={0}
						initialDimension={{ width: 320, height: CHART_HEIGHT }}
					>
						<AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
							<defs>
								<linearGradient id="analyticsDrawdownFill" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor="#EF4444" stopOpacity={0.35} />
									<stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
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
							<YAxis hide domain={[0, 'auto']} />
							<Tooltip content={(props) => <DrawdownTooltip {...props} currency={currency} />} />
							<Area
								type="monotone"
								dataKey="drawdownPercent"
								stroke="#EF4444"
								strokeWidth={2.5}
								fill="url(#analyticsDrawdownFill)"
								isAnimationActive={false}
								dot={false}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			)}
		</div>
	);
}
