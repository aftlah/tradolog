import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import { formatCurrency, formatNumber } from '@shared/utils/format';
import type { RiskAlertDto } from '@features/risk/types/risk.types';

interface RiskAlertsCardProps {
	alerts: RiskAlertDto[];
	currency: string;
}

function formatAlertValue(alert: RiskAlertDto, currency: string): string {
	if (alert.unit === 'currency') {
		return `${formatCurrency(alert.currentValue, currency)} / ${formatCurrency(alert.limitValue, currency)}`;
	}
	if (alert.unit === 'percent') {
		return `${formatNumber(alert.currentValue, 1)}% / ${formatNumber(alert.limitValue, 1)}%`;
	}
	return `${formatNumber(alert.currentValue, 0)} / ${formatNumber(alert.limitValue, 0)}`;
}

/** Surfacing standing risk-rule breaches for the active account. */
export function RiskAlertsCard({ alerts, currency }: RiskAlertsCardProps) {
	if (alerts.length === 0) {
		return null;
	}

	return (
		<section
			aria-label="Risk alerts"
			className="glass-card space-y-3 border-warning/20 p-5"
		>
			<div className="flex items-center gap-2">
				<ShieldAlert className="size-4 text-warning" aria-hidden="true" />
				<h2 className="text-sm font-medium text-foreground">Risk Alerts</h2>
				<a href="/app/settings?tab=risk" className="ml-auto text-xs text-muted underline-offset-2 hover:text-foreground hover:underline">
					Manage rules
				</a>
			</div>

			<ul className="space-y-2">
				{alerts.map((alert) => {
					const isDanger = alert.severity === 'danger';
					return (
						<li
							key={alert.ruleId}
							className={cn(
								'flex gap-3 rounded-xl border px-3 py-3',
								isDanger ? 'border-danger/30 bg-danger/10' : 'border-warning/30 bg-warning/10',
							)}
						>
							<AlertTriangle
								className={cn('mt-0.5 size-4 shrink-0', isDanger ? 'text-danger' : 'text-warning')}
								aria-hidden="true"
							/>
							<div className="min-w-0 flex-1">
								<p className={cn('text-sm font-medium', isDanger ? 'text-danger' : 'text-warning')}>{alert.title}</p>
								<p className="mt-0.5 text-xs text-muted">{alert.message}</p>
								<p className="mt-1 text-xs tabular-nums text-foreground/80">{formatAlertValue(alert, currency)}</p>
							</div>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
