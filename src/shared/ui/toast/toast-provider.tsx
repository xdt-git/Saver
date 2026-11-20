import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getErrorMessage } from "@/shared/api";
import {
    MAX_VISIBLE_TOASTS,
    TOAST_DURATION_MS,
    ToastContext,
    type Toast,
    type ToastAction,
    type ToastApi,
    type ToastType,
} from "./toast-context";
import { ToastViewport } from "./toast-viewport";

let nextId = 0;
const createToastId = () => `toast-${++nextId}`;

/** Holds the toast queue and exposes a stable API through context. */
export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

    const dismiss = useCallback((id: string) => {
        clearTimeout(timers.current.get(id));
        timers.current.delete(id);
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const dismissAll = useCallback(() => {
        timers.current.forEach(clearTimeout);
        timers.current.clear();
        setToasts([]);
    }, []);

    const show = useCallback(
        (type: ToastType, message: string, action?: ToastAction) => {
            const id = createToastId();
            setToasts((current) =>
                [...current, { id, type, message, action }].slice(-MAX_VISIBLE_TOASTS),
            );
            timers.current.set(
                id,
                setTimeout(() => dismiss(id), TOAST_DURATION_MS),
            );
            return id;
        },
        [dismiss],
    );

    useEffect(() => {
        const activeTimers = timers.current;
        return () => activeTimers.forEach(clearTimeout);
    }, []);

    const api = useMemo<ToastApi>(
        () => ({
            show,
            success: (message, action) => show("success", message, action),
            error: (message, action) => show("error", message, action),
            warning: (message, action) => show("warning", message, action),
            info: (message, action) => show("info", message, action),
            apiError: (error) => show("error", getErrorMessage(error)),
            dismiss,
            dismissAll,
        }),
        [show, dismiss, dismissAll],
    );

    return (
        <ToastContext.Provider value={api}>
            {children}
            <ToastViewport toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    );
};
