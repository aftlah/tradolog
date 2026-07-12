import * as React from 'react';
import { cn } from '@shared/utils/cn';

export type TextareaProps = React.ComponentProps<'textarea'>;

function Textarea({ className, ...props }: TextareaProps) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				'flex min-h-24 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-foreground shadow-soft transition-colors duration-200',
				'placeholder:text-muted-foreground',
				'focus-visible:outline-none focus-visible:border-primary/45 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring focus-visible:ring-offset-0',
				'disabled:cursor-not-allowed disabled:opacity-50',
				'backdrop-blur-md',
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
