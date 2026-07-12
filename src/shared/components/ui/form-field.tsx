import type { ReactNode } from 'react';
import { Label } from './label';
import { cn } from '@shared/utils/cn';

interface FormFieldProps {
	id: string;
	label: string;
	error?: string;
	hint?: string;
	optional?: boolean;
	className?: string;
	children: ReactNode;
}

/**
 * Label + control + error-message wrapper reused by every React Hook Form field across the app,
 * so each feature form only wires up `register`/`Controller` without re-implementing markup.
 */
export function FormField({ id, label, error, hint, optional, className, children }: FormFieldProps) {
	return (
		<div className={cn('space-y-2', className)}>
			<div className="flex items-baseline justify-between">
				<Label htmlFor={id}>{label}</Label>
				{optional ? <span className="text-xs text-muted">Optional</span> : null}
			</div>
			{children}
			{error ? (
				<p id={`${id}-error`} className="text-sm text-danger" role="alert">
					{error}
				</p>
			) : hint ? (
				<p className="text-xs text-muted">{hint}</p>
			) : null}
		</div>
	);
}
