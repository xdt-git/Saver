import { forwardRef, useId, type InputHTMLAttributes } from "react";
import styles from "./checkbox.module.scss";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label: string;
    hint?: string;
}

/** Checkbox with its label and an optional explanation under it. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, hint, id, ...rest }, ref) => {
        const autoId = useId();
        const inputId = id ?? autoId;
        return (
            <div className={styles.field}>
                <input
                    ref={ref}
                    id={inputId}
                    type="checkbox"
                    className={styles.box}
                    aria-describedby={hint ? `${inputId}-hint` : undefined}
                    {...rest}
                />
                <label htmlFor={inputId} className={styles.label}>
                    {label}
                </label>
                {hint && (
                    <span id={`${inputId}-hint`} className={styles.hint}>
                        {hint}
                    </span>
                )}
            </div>
        );
    },
);

Checkbox.displayName = "Checkbox";
