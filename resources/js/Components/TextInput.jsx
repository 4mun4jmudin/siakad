import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 shadow-inner focus:border-sky-400 dark:focus:border-sky-500 focus:bg-white/90 dark:focus:bg-slate-800/90 focus:ring-4 focus:ring-sky-100/50 dark:focus:ring-sky-900/50 outline-none transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 ' +
                className
            }
            ref={localRef}
        />
    );
});
