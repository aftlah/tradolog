import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input, type InputProps } from '@shared/components';
import { cn } from '@shared/utils/cn';

export type PasswordInputProps = Omit<InputProps, 'type'> & {
	toggleLabelShow?: string;
	toggleLabelHide?: string;
};

export function PasswordInput({
	className,
	toggleLabelShow = 'Show password',
	toggleLabelHide = 'Hide password',
	...props
}: PasswordInputProps) {
	const [visible, setVisible] = React.useState(false);

	return (
		<div className="relative">
			<Input
				type={visible ? 'text' : 'password'}
				className={cn('pr-11', className)}
				autoComplete={props.autoComplete}
				{...props}
			/>
			<button
				type="button"
				className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1 text-muted transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				aria-label={visible ? toggleLabelHide : toggleLabelShow}
				onClick={() => setVisible((current) => !current)}
			>
				{visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
			</button>
		</div>
	);
}
