import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { ApiError } from "@/shared/api";
import { MAX_VISIBLE_TOASTS, TOAST_DURATION_MS, useToast, type ToastApi } from "./toast-context";
import { ToastProvider } from "./toast-provider";

/** Captures the toast API so tests can call it directly. */
let api: ToastApi;
const Capture = () => {
    const toast = useToast();
    useEffect(() => {
        api = toast;
    }, [toast]);
    return null;
};

const renderToasts = () =>
    render(
        <ToastProvider>
            <Capture />
        </ToastProvider>,
    );

describe("Toast", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("shows every type with the right screen-reader role", () => {
        renderToasts();
        act(() => {
            api.success("Saved");
            api.info("Heads up");
            api.error("Failed");
            api.warning("Careful");
        });
        expect(screen.getAllByRole("status").map((el) => el.textContent)).toEqual([
            expect.stringContaining("Saved"),
            expect.stringContaining("Heads up"),
        ]);
        expect(screen.getAllByRole("alert").map((el) => el.textContent)).toEqual([
            expect.stringContaining("Failed"),
            expect.stringContaining("Careful"),
        ]);
    });

    it("dismisses automatically after the duration", () => {
        vi.useFakeTimers();
        renderToasts();
        act(() => {
            api.success("Saved");
        });
        act(() => vi.advanceTimersByTime(TOAST_DURATION_MS - 1));
        expect(screen.getByText("Saved")).toBeInTheDocument();
        act(() => vi.advanceTimersByTime(1));
        expect(screen.queryByText("Saved")).toBeNull();
    });

    it("closes with the translated close button", async () => {
        renderToasts();
        act(() => {
            api.info("Heads up");
        });
        await userEvent.click(
            within(screen.getByRole("status")).getByRole("button", { name: "Закрыть" }),
        );
        expect(screen.queryByText("Heads up")).toBeNull();
    });

    it("runs the action button", async () => {
        const onUndo = vi.fn();
        renderToasts();
        act(() => {
            api.info("Removed", { label: "Undo", onClick: onUndo });
        });
        await userEvent.click(screen.getByRole("button", { name: "Undo" }));
        expect(onUndo).toHaveBeenCalledTimes(1);
    });

    it("keeps only the newest toasts", () => {
        renderToasts();
        act(() => {
            for (let i = 1; i <= MAX_VISIBLE_TOASTS + 2; i++) api.info(`Toast ${i}`);
        });
        expect(screen.getAllByRole("status")).toHaveLength(MAX_VISIBLE_TOASTS);
        expect(screen.queryByText("Toast 1")).toBeNull();
        expect(screen.getByText(`Toast ${MAX_VISIBLE_TOASTS + 2}`)).toBeInTheDocument();
    });

    it("translates a real ApiError by its code", () => {
        renderToasts();
        act(() => {
            api.apiError(new ApiError({ status: 0, code: "NETWORK_ERROR" }));
            api.apiError(new Error("unexpected"));
        });
        const alerts = screen.getAllByRole("alert");
        expect(alerts[0]).toHaveTextContent("Нет связи с сервером. Проверьте интернет.");
        expect(alerts[1]).toHaveTextContent("Что-то пошло не так.");
    });

    it("dismisses all toasts at once", () => {
        renderToasts();
        act(() => {
            api.success("One");
            api.error("Two");
        });
        act(() => api.dismissAll());
        expect(screen.queryByRole("status")).toBeNull();
        expect(screen.queryByRole("alert")).toBeNull();
    });

    it("keeps the API object stable between renders", () => {
        const { rerender } = renderToasts();
        const first = api;
        act(() => {
            api.success("Saved");
        });
        rerender(
            <ToastProvider>
                <Capture />
            </ToastProvider>,
        );
        expect(api).toBe(first);
    });

    it("throws a clear error outside the provider", () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        expect(() => render(<Capture />)).toThrow("useToast must be used inside <ToastProvider>");
    });
});
