import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@shared/utils/cn';

const badgeVariants = cva(
	'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
	{
		variants: {
			variant: {
				default: 'border-white/10 bg-white/5 text-foreground',
				success: 'border-success/30 bg-success/10 text-success',
				danger: 'border-danger/30 bg-danger/10 text-danger',
				warning: 'border-warning/30 bg-warning/10 text-warning',
				primary: 'border-primary/30 bg-primary/10 text-primary',
				muted: 'border-white/10 bg-white/5 text-muted',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

export type BadgeProps = React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
	return <span data-slot="badge" className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
