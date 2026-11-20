import type { ReactNode } from "react";
import { cn } from "@/shared/lib";
import styles from "./form-field.module.scss";

export interface FormFieldProps {
    /** Id of the control, links the label and the messages to it. */
    id: string;
    label?: string;
    hint?: string;
    error?: string;
    /** Class of the whole field (label + control), e.g. a narrower width. */
    className?: string;
    children: ReactNode;
}

/** Label + control + hint/error. Shared by Input, Select and future form controls. */
export const FormField = ({ id, label, hint, error, className, children }: FormFieldProps) => (
    <div className={cn(styles.field, className)}>
        {label && (
            <label htmlFor={id} className={styles.label}>
                {label}
            </label>
        )}
        {children}
        {error ? (
            <span id={`${id}-error`} role="alert" className={styles.error}>
                {error}
            </span>
        ) : (
            hint && (
                <span id={`${id}-hint`} className={styles.hint}>
                    {hint}
                </span>
            )
        )}
    </div>
);
