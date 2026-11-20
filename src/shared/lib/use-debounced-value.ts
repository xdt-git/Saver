import { useEffect, useState } from "react";

export const DEBOUNCE_MS = 400;

/** The value after it has stopped changing for `delay` ms (search as you type). */
export const useDebouncedValue = <T>(value: T, delay = DEBOUNCE_MS): T => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
};
