export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all duration-300 hover:from-sky-700 hover:to-indigo-700 hover:scale-105 hover:shadow-xl hover:shadow-sky-500/40 focus:outline-none focus:ring-4 focus:ring-sky-500/50 active:scale-95 ${
                    disabled && 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-lg'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
