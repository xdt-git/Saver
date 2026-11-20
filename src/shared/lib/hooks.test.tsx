import { renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEscapeKey } from "./use-escape-key";
import { useScrollLock } from "./use-scroll-lock";

describe("useScrollLock", () => {
    it("restores scrolling only after the last lock is released", () => {
        document.body.style.overflow = "auto";
        const menu = renderHook(({ active }) => useScrollLock(active), {
            initialProps: { active: true },
        });
        const dialog = renderHook(() => useScrollLock(true));
        expect(document.body.style.overflow).toBe("hidden");

        menu.rerender({ active: false });
        expect(document.body.style.overflow).toBe("hidden");

        dialog.unmount();
        expect(document.body.style.overflow).toBe("auto");
    });
});

describe("useEscapeKey", () => {
    it("calls the latest handler only while active", async () => {
        const first = vi.fn();
        const second = vi.fn();
        const { rerender } = renderHook(({ active, handler }) => useEscapeKey(active, handler), {
            initialProps: { active: true, handler: first },
        });

        rerender({ active: true, handler: second });
        await userEvent.keyboard("{Escape}");
        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledTimes(1);

        rerender({ active: false, handler: second });
        await userEvent.keyboard("{Escape}");
        expect(second).toHaveBeenCalledTimes(1);
    });
});
