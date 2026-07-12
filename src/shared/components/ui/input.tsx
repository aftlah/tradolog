import * as React from 'react';
import { cn } from '@shared/utils/cn';

export type InputProps = React.ComponentProps<'input'>;

function Input({ className, type, ...props }: InputProps) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				'flex h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-foreground shadow-soft transition-colors duration-200',
				'placeholder:text-muted-foreground',
				'file:border-0 file:bg-transparent file:text-sm file:font-medium',
				// Inset focus ring — outer ring+offset gets clipped inside dialog/scroll containers.
				'focus-visible:outline-none focus-visible:border-primary/45 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring focus-visible:ring-offset-0',
				'disabled:cursor-not-allowed disabled:opacity-50',
				'backdrop-blur-md',
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
