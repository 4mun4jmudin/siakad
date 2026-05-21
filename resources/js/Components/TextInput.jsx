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
                'rounded-xl border border-slate-200/60 bg-white/60 backdrop-blur-md px-4 py-2.5 text-sm text-slate-800 shadow-inner focus:border-sky-400 focus:bg-white/90 focus:ring-4 focus:ring-sky-100/50 outline-none transition-all duration-300 placeholder:text-slate-400 ' +
                className
            }
            ref={localRef}
        />
    );
});
