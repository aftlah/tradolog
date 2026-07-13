import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AUTH_EQUITY_SERIES } from '@features/auth/constants/auth.constants';

const CHART_HEIGHT = 176;

export function EquityCurveChart() {
	return (
		<div className="w-full min-w-0" style={{ height: CHART_HEIGHT }} role="img" aria-label="Illustrative equity curve chart">
			<ResponsiveContainer
				width="100%"
				height={CHART_HEIGHT}
				minWidth={0}
				initialDimension={{ width: 480, height: CHART_HEIGHT }}
			>
				<AreaChart data={[...AUTH_EQUITY_SERIES]} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
					<defs>
						<linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#2563EB" stopOpacity={0.45} />
							<stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
						</linearGradient>
					</defs>
					<XAxis dataKey="day" hide />
					<YAxis hide domain={['auto', 'auto']} />
					<Tooltip
						contentStyle={{
							background: 'rgba(24,24,27,0.92)',
							border: '1px solid rgba(255,255,255,0.1)',
							borderRadius: 12,
							color: '#FAFAFA',
							fontSize: 12,
						}}
						formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Equity']}
					/>
					<Area
						type="monotone"
						dataKey="equity"
						stroke="#818cf8"
						strokeWidth={2.5}
						fill="url(#equityFill)"
						isAnimationActive={false}
						dot={false}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}
