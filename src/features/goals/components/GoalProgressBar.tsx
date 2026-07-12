import { cn } from '@shared/utils/cn';

interface GoalProgressBarProps {
	label: string;
	actualLabel: string;
	targetLabel: string | null;
	percent: number | null;
	isMet: boolean;
}

/** A single target-vs-actual row: label, values, and a capped progress bar tinted by goal status. */
export function GoalProgressBar({ label, actualLabel, targetLabel, percent, isMet }: GoalProgressBarProps) {
	const clampedPercent = percent === null ? 0 : Math.min(Math.max(percent, 0), 100);

	return (
		<div className="space-y-1.5">
			<div className="flex items-baseline justify-between gap-2 text-xs">
				<span className="text-muted">{label}</span>
				<span className="font-medium text-foreground">
					{actualLabel}
					{targetLabel ? <span className="text-muted"> / {targetLabel}</span> : null}
				</span>
			</div>
			<div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
				{targetLabel ? (
					<div
						className={cn('h-full rounded-full transition-all duration-300', isMet ? 'bg-success' : 'bg-primary')}
						style={{ width: `${clampedPercent}%` }}
					/>
				) : null}
			</div>
		</div>
	);
}
