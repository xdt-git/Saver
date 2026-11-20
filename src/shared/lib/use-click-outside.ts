import { useEffect, useRef, type RefObject } from "react";

/** Calls `onOutside` on a pointer press outside `ref` while `active` is true. */
export const useClickOutside = <T extends HTMLElement>(
    ref: RefObject<T>,
    active: boolean,
    onOutside: () => void,
) => {
    const handler = useRef(onOutside);
    handler.current = onOutside;

    useEffect(() => {
        if (!active) return;
        const onPointerDown = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) handler.current();
        };
        document.addEventListener("mousedown", onPointerDown);
        return () => document.removeEventListener("mousedown", onPointerDown);
    }, [ref, active]);
};
