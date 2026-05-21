export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
