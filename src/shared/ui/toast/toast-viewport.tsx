import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { MdCheckCircle, MdError, MdInfo, MdWarning } from "react-icons/md";
import { Button } from "../button";
import { toastRole, type Toast, type ToastType } from "./toast-context";
import styles from "./toast.module.scss";

const icons: Record<ToastType, JSX.Element> = {
    success: <MdCheckCircle />,
    error: <MdError />,
    warning: <MdWarning />,
    info: <MdInfo />,
};

interface ToastViewportProps {
    toasts: Toast[];
    onDismiss: (id: string) => void;
}

/** Renders the toast stack in a portal: top-right on desktop, bottom on phones. */
export const ToastViewport = ({ toasts, onDismiss }: ToastViewportProps) => {
    const { t } = useTranslation();

    return createPortal(
        <ol className={styles.viewport}>
            {toasts.map((toast) => (
                <li
                    key={toast.id}
                    role={toastRole(toast.type)}
                    className={`${styles.toast} ${styles[toast.type]}`}
                >
                    <span className={styles.icon} aria-hidden="true">
                        {icons[toast.type]}
                    </span>
                    <span className={styles.message}>{toast.message}</span>
                    {toast.action && (
                        <Button variant="secondary" size="md" onClick={toast.action.onClick}>
                            {toast.action.label}
                        </Button>
                    )}
                    <Button
                        variant="icon"
                        aria-label={t("common.close")}
                        className={styles.close}
                        onClick={() => onDismiss(toast.id)}
                    >
                        ×
                    </Button>
                </li>
            ))}
        </ol>,
        document.body,
    );
};
