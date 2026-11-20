import { createContext, useContext } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

/** Auto-dismiss delay. */
export const TOAST_DURATION_MS = 5000;
/** Older toasts are dropped when more than this many are shown. */
export const MAX_VISIBLE_TOASTS = 5;

export interface ToastAction {
    label: string;
    onClick: () => void;
}

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    action?: ToastAction;
}

type ShowToast = (message: string, action?: ToastAction) => string;

export interface ToastApi {
    show: (type: ToastType, message: string, action?: ToastAction) => string;
    success: ShowToast;
    error: ShowToast;
    warning: ShowToast;
    info: ShowToast;
    /** Shows any error as a localized error toast (API errors are translated by code). */
    apiError: (error: unknown) => string;
    dismiss: (id: string) => void;
    dismissAll: () => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

/** Toast API. Must be used inside <ToastProvider>. */
export const useToast = (): ToastApi => {
    const api = useContext(ToastContext);
    if (!api) throw new Error("useToast must be used inside <ToastProvider>");
    return api;
};

/** Errors and warnings interrupt screen readers; success and info wait politely. */
export const toastRole = (type: ToastType): "alert" | "status" =>
    type === "error" || type === "warning" ? "alert" : "status";
