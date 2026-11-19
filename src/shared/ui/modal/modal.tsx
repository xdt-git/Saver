import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../button";
import { Text } from "../text";
import styles from "./modal.module.scss";

export interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    /** Actions at the bottom, e.g. Cancel / Confirm buttons. */
    footer?: ReactNode;
    /** Accessible label of the close button. Defaults to the translated "Close". */
    closeLabel?: string;
}

/**
 * Dialog rendered in a portal. Closes on Escape and on a click outside the dialog,
 * locks page scroll while open and returns focus to the previously focused element.
 */
export const Modal = ({ open, onClose, title, children, footer, closeLabel }: ModalProps) => {
    const { t } = useTranslation();
    const titleId = useId();
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;

        const previouslyFocused = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        dialogRef.current?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = previousOverflow;
            previouslyFocused?.focus();
        };
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div
            className={styles.overlay}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className={styles.dialog}
            >
                <div className={styles.header}>
                    <Text as="h2" id={titleId} glow className={styles.title}>
                        {title}
                    </Text>
                    <Button
                        variant="icon"
                        aria-label={closeLabel ?? t("common.close")}
                        className={styles.close}
                        onClick={onClose}
                    >
                        ×
                    </Button>
                </div>
                {children}
                {footer && <div className={styles.footer}>{footer}</div>}
            </div>
        </div>,
        document.body,
    );
};
