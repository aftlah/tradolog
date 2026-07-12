export function AuthDivider() {
	return (
		<div className="relative my-6" role="separator" aria-orientation="horizontal">
			<div className="absolute inset-0 flex items-center">
				<div className="w-full border-t border-white/10" />
			</div>
			<div className="relative flex justify-center text-xs uppercase tracking-[0.18em]">
				<span className="bg-transparent px-3 text-muted backdrop-blur-sm">or</span>
			</div>
		</div>
	);
}
