import type { ReactNode } from "react";
import styles from "./form-field.module.scss";

export interface FormFieldProps {
    /** Id of the control, links the label and the messages to it. */
    id: string;
    label?: string;
    hint?: string;
    error?: string;
    children: ReactNode;
}

/** Label + control + hint/error. Shared by Input, Select and future form controls. */
export const FormField = ({ id, label, hint, error, children }: FormFieldProps) => (
    <div className={styles.field}>
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
