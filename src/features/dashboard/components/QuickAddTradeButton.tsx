import { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@shared/components';

/**
 * Quick Add Trade entry point for the dashboard. Trade CRUD is a separate, not-yet-built
 * feature (per the project's "finish one feature before starting the next" workflow), so this
 * opens an honest "coming soon" dialog rather than a half-built trade form.
 */
export function QuickAddTradeButton() {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<Button onClick={() => setOpen(true)} size="sm" className="gap-1.5">
				<Plus className="size-4" aria-hidden="true" />
				<span className="hidden sm:inline">Quick Add Trade</span>
			</Button>
			<DialogContent>
				<DialogHeader>
					<div className="flex items-center gap-2 text-primary">
						<Sparkles className="size-5" aria-hidden="true" />
						<DialogTitle>Trade logging is on its way</DialogTitle>
					</div>
					<DialogDescription>
						Quick Add will let you log a trade — symbol, entry/exit, risk, and outcome — in seconds. It
						ships with the upcoming Trade CRUD feature, once every calculation here is wired end to end.
					</DialogDescription>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}
