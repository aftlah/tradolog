import { Flame } from 'lucide-react';
import type { StreakSummary } from '@shared/services';

interface AnalyticsStreaksCardProps {
	streaks: StreakSummary;
}

interface StreakTileProps {
	label: string;
	value: number;
	suffix: string;
	accentClassName: string;
}

function StreakTile({ label, value, suffix, accentClassName }: StreakTileProps) {
	return (
		<div className="flex flex-col gap-1 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
			<span className="text-xs font-medium text-muted">{label}</span>
			<span className={`text-xl font-semibold tracking-tight ${accentClassName}`}>
				{value}
				<span className="ml-1 text-sm font-medium text-muted">{suffix}</span>
			</span>
		</div>
	);
}

/** Win/loss streak breakdown, sourced from `TradingCalculatorService.streaks()`. */
export function AnalyticsStreaksCard({ streaks }: AnalyticsStreaksCardProps) {
	const isOnWinStreak = streaks.currentWinStreak > 0;
	const isOnLossStreak = streaks.currentLossStreak > 0;

	return (
		<div className="glass-card flex h-full flex-col gap-4 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-sm font-medium text-muted">Streaks</h2>
					<p className="text-lg font-semibold tracking-tight text-foreground">Consistency tracker</p>
				</div>
				<div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
					<Flame className="size-4.5" aria-hidden="true" />
				</div>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<StreakTile
					label="Current Win Streak"
					value={streaks.currentWinStreak}
					suffix="wins"
					accentClassName={isOnWinStreak ? 'text-success' : 'text-foreground'}
				/>
				<StreakTile
					label="Current Loss Streak"
					value={streaks.currentLossStreak}
					suffix="losses"
					accentClassName={isOnLossStreak ? 'text-danger' : 'text-foreground'}
				/>
				<StreakTile label="Max Win Streak" value={streaks.maxWinStreak} suffix="wins" accentClassName="text-success" />
				<StreakTile label="Max Loss Streak" value={streaks.maxLossStreak} suffix="losses" accentClassName="text-danger" />
			</div>
		</div>
	);
}
