import React from 'react';
import { cn } from '@/lib/utils';

function Card({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				'relative w-full max-w-sm rounded-2xl',
				'p-1.5 shadow-2xl',
				'border border-white/10 bg-[#111111]',
				className,
			)}
			{...props}
		/>
	);
}

function Header({
	className,
	children,
	glassEffect = true,
	...props
}: React.ComponentProps<'div'> & {
	glassEffect?: boolean;
}) {
	return (
		<div
			className={cn(
				'relative mb-4 rounded-xl border border-white/8 bg-white/5 p-5',
				className,
			)}
			{...props}
		>
			{glassEffect && (
				<div
					aria-hidden="true"
					className="absolute inset-x-0 top-0 h-48 rounded-[inherit]"
					style={{
						background:
							'linear-gradient(180deg, rgba(234,179,8,0.06) 0%, rgba(234,179,8,0.02) 40%, rgba(0,0,0,0) 100%)',
					}}
				/>
			)}
			{children}
		</div>
	);
}

function Plan({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn('mb-8 flex items-center justify-between', className)}
			{...props}
		/>
	);
}

function Description({ className, ...props }: React.ComponentProps<'p'>) {
	return (
		<p className={cn('text-sm text-white/50', className)} {...props} />
	);
}

function PlanName({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				"flex items-center gap-2 text-sm font-semibold text-white/70 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		/>
	);
}

function Badge({ className, ...props }: React.ComponentProps<'span'>) {
	return (
		<span
			className={cn(
				'rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold',
				className,
			)}
			{...props}
		/>
	);
}

function Price({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div className={cn('mb-3 flex items-end gap-1', className)} {...props} />
	);
}

function MainPrice({ className, ...props }: React.ComponentProps<'span'>) {
	return (
		<span
			className={cn('text-4xl font-extrabold tracking-tight text-white', className)}
			{...props}
		/>
	);
}

function Period({ className, ...props }: React.ComponentProps<'span'>) {
	return (
		<span
			className={cn('pb-1 text-sm text-white/50', className)}
			{...props}
		/>
	);
}

function OriginalPrice({ className, ...props }: React.ComponentProps<'span'>) {
	return (
		<span
			className={cn(
				'mr-1 ml-auto text-lg line-through text-white/30',
				className,
			)}
			{...props}
		/>
	);
}

function Body({ className, ...props }: React.ComponentProps<'div'>) {
	return <div className={cn('space-y-6 p-3 pt-1', className)} {...props} />;
}

function List({ className, ...props }: React.ComponentProps<'ul'>) {
	return <ul className={cn('space-y-3', className)} {...props} />;
}

function ListItem({ className, ...props }: React.ComponentProps<'li'>) {
	return (
		<li
			className={cn(
				'flex items-start gap-3 text-sm text-white/60',
				className,
			)}
			{...props}
		/>
	);
}

function Separator({
	children = 'Pro features',
	className,
	...props
}: React.ComponentProps<'div'> & {
	children?: string;
	className?: string;
}) {
	return (
		<div
			className={cn(
				'flex items-center gap-3 text-sm text-white/30',
				className,
			)}
			{...props}
		>
			<span className="h-[1px] flex-1 bg-white/10" />
			<span className="shrink-0 text-xs uppercase tracking-widest">{children}</span>
			<span className="h-[1px] flex-1 bg-white/10" />
		</div>
	);
}

export {
	Card,
	Header,
	Description,
	Plan,
	PlanName,
	Badge,
	Price,
	MainPrice,
	Period,
	OriginalPrice,
	Body,
	List,
	ListItem,
	Separator,
};
