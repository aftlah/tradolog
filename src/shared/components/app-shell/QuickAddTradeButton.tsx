import { Plus } from 'lucide-react';
import { Button } from '../ui/button';

/** Jumps straight to the Create Trade form. A thin, presentational link styled as a button. */
export function QuickAddTradeButton() {
	return (
		<Button asChild size="sm" className="gap-1.5">
			<a href="/app/trades/new">
				<Plus className="size-4" aria-hidden="true" />
				<span className="hidden sm:inline">Quick Add Trade</span>
			</a>
		</Button>
	);
}
