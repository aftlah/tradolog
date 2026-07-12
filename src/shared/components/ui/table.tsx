import * as React from 'react';
import { cn } from '@shared/utils/cn';

function Table({ className, ...props }: React.ComponentProps<'table'>) {
	return (
		<div className="w-full overflow-x-auto">
			<table data-slot="table" className={cn('w-full caption-bottom text-sm', className)} {...props} />
		</div>
	);
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
	return <thead data-slot="table-header" className={cn('[&_tr]:border-b [&_tr]:border-white/8', className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
	return (
		<tbody data-slot="table-body" className={cn('[&_tr:last-child]:border-0', className)} {...props} />
	);
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
	return (
		<tr
			data-slot="table-row"
			className={cn(
				'border-b border-white/5 transition-colors hover:bg-white/[0.03] data-[state=selected]:bg-white/5',
				className,
			)}
			{...props}
		/>
	);
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
	return (
		<th
			data-slot="table-head"
			className={cn(
				'h-10 px-4 text-left align-middle text-xs font-medium tracking-wide text-muted uppercase [&:has([role=checkbox])]:pr-0',
				className,
			)}
			{...props}
		/>
	);
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
	return (
		<td
			data-slot="table-cell"
			className={cn('px-4 py-3 align-middle [&:has([role=checkbox])]:pr-0', className)}
			{...props}
		/>
	);
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
