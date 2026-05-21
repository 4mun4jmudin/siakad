export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center gap-2 rounded-xl border border-slate-200/60 bg-white/60 backdrop-blur-md px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:bg-white/80 hover:shadow-md hover:border-slate-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                    disabled && 'opacity-50 hover:scale-100 hover:shadow-sm'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
