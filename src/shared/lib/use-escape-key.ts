import { useEffect, useRef } from "react";

/** Calls `onEscape` when Escape is pressed while `active` is true. */
export const useEscapeKey = (active: boolean, onEscape: () => void) => {
    // Keep the latest callback without re-subscribing on every render.
    const handler = useRef(onEscape);
    handler.current = onEscape;

    useEffect(() => {
        if (!active) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") handler.current();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [active]);
};
