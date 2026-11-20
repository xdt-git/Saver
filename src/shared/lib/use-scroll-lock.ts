import { useEffect } from "react";

// Several overlays can be open at once (menu + dialog): count locks and restore
// the original overflow only when the last one is released.
let locks = 0;
let savedOverflow = "";

/** Locks page scrolling while `active` is true. */
export const useScrollLock = (active: boolean) => {
    useEffect(() => {
        if (!active) return;
        if (locks === 0) {
            savedOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";
        }
        locks += 1;
        return () => {
            locks -= 1;
            if (locks === 0) document.body.style.overflow = savedOverflow;
        };
    }, [active]);
};
