import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

interface PaginationProps {
	page: number;
	pageCount: number;
	onPageChange: (page: number) => void;
	disabled?: boolean;
}

/** Generic prev/next + numbered pagination control, reused across every data table in the app. */
export function Pagination({ page, pageCount, onPageChange, disabled }: PaginationProps) {
	if (pageCount <= 1) {
		return null;
	}

	const pages = getVisiblePages(page, pageCount);

	return (
		<nav aria-label="Pagination" className="flex items-center justify-between gap-3">
			<Button
				type="button"
				variant="outline"
				size="sm"
				disabled={disabled || page <= 1}
				onClick={() => onPageChange(page - 1)}
			>
				<ChevronLeft className="size-4" aria-hidden="true" />
				<span className="hidden sm:inline">Previous</span>
			</Button>

			<div className="flex items-center gap-1">
				{pages.map((entry, index) =>
					entry === 'ellipsis' ? (
						<span key={`ellipsis-${index}`} className="px-1.5 text-sm text-muted">
							…
						</span>
					) : (
						<button
							key={entry}
							type="button"
							disabled={disabled}
							aria-current={entry === page ? 'page' : undefined}
							onClick={() => onPageChange(entry)}
							className={
								entry === page
									? 'flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-medium text-primary-foreground'
									: 'flex size-9 items-center justify-center rounded-xl text-sm font-medium text-muted transition-colors hover:bg-white/8 hover:text-foreground'
							}
						>
							{entry}
						</button>
					),
				)}
			</div>

			<Button
				type="button"
				variant="outline"
				size="sm"
				disabled={disabled || page >= pageCount}
				onClick={() => onPageChange(page + 1)}
			>
				<span className="hidden sm:inline">Next</span>
				<ChevronRight className="size-4" aria-hidden="true" />
			</Button>
		</nav>
	);
}

function getVisiblePages(page: number, pageCount: number): Array<number | 'ellipsis'> {
	const delta = 1;
	const pages: Array<number | 'ellipsis'> = [];

	for (let i = 1; i <= pageCount; i += 1) {
		if (i === 1 || i === pageCount || (i >= page - delta && i <= page + delta)) {
			pages.push(i);
		} else if (pages[pages.length - 1] !== 'ellipsis') {
			pages.push('ellipsis');
		}
	}

	return pages;
}
