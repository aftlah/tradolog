import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@shared/utils/cn';

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

function SelectTrigger({
	className,
	children,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
	return (
		<SelectPrimitive.Trigger
			data-slot="select-trigger"
			className={cn(
				'flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-foreground shadow-soft backdrop-blur-md transition-colors duration-200',
				'data-[placeholder]:text-muted-foreground',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
				'disabled:cursor-not-allowed disabled:opacity-50',
				'[&>span]:line-clamp-1',
				className,
			)}
			{...props}
		>
			{children}
			<SelectPrimitive.Icon asChild>
				<ChevronDown className="size-4 shrink-0 text-muted" aria-hidden="true" />
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
}

function SelectContent({
	className,
	children,
	position = 'popper',
	...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Content
				data-slot="select-content"
				position={position}
				className={cn(
					'glass-panel relative z-50 max-h-72 min-w-[10rem] overflow-hidden p-1.5 text-foreground shadow-glass',
					position === 'popper' &&
						'data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1',
					className,
				)}
				{...props}
			>
				<SelectPrimitive.Viewport
					className={cn(
						position === 'popper' &&
							'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
					)}
				>
					{children}
				</SelectPrimitive.Viewport>
			</SelectPrimitive.Content>
		</SelectPrimitive.Portal>
	);
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
	return (
		<SelectPrimitive.Label
			data-slot="select-label"
			className={cn('px-2.5 py-1.5 text-xs font-medium text-muted', className)}
			{...props}
		/>
	);
}

function SelectItem({
	className,
	children,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
	return (
		<SelectPrimitive.Item
			data-slot="select-item"
			className={cn(
				'relative flex w-full cursor-pointer select-none items-center rounded-lg px-2.5 py-2 text-sm outline-none transition-colors duration-150',
				'focus:bg-white/8 focus:text-foreground',
				'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
				className,
			)}
			{...props}
		>
			<span className="absolute right-2.5 flex size-3.5 items-center justify-center">
				<SelectPrimitive.ItemIndicator>
					<Check className="size-3.5 text-primary" aria-hidden="true" />
				</SelectPrimitive.ItemIndicator>
			</span>
			<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
		</SelectPrimitive.Item>
	);
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
	return (
		<SelectPrimitive.Separator
			data-slot="select-separator"
			className={cn('-mx-1 my-1 h-px bg-white/8', className)}
			{...props}
		/>
	);
}

export {
	Select,
	SelectGroup,
	SelectValue,
	SelectTrigger,
	SelectContent,
	SelectLabel,
	SelectItem,
	SelectSeparator,
};
