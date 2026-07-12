import type { ReactNode } from 'react';
import { cn } from '@shared/utils/cn';

type GlassCardProps = {
	children: ReactNode;
	className?: string;
};

export function GlassCard({ children, className }: GlassCardProps) {
	return <div className={cn('glass-card p-6 md:p-8', className)}>{children}</div>;
}
