import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/lib";
import { FormField, controlClassNames, describedBy } from "../form-field";
import styles from "./textarea.module.scss";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    hint?: string;
    error?: string;
    /** Class of the whole field (label + control). */
    fieldClassName?: string;
}

/** Multi-line text with the same look and messages as Input. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, hint, error, id, className, fieldClassName, rows = 4, ...rest }, ref) => {
        const autoId = useId();
        const textareaId = id ?? autoId;

        return (
            <FormField
                id={textareaId}
                label={label}
                hint={hint}
                error={error}
                className={fieldClassName}
            >
                <textarea
                    ref={ref}
                    id={textareaId}
                    rows={rows}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy(textareaId, hint, error)}
                    className={cn(
                        controlClassNames.control,
                        styles.textarea,
                        error && controlClassNames.invalid,
                        className,
                    )}
                    {...rest}
                />
            </FormField>
        );
    },
);

Textarea.displayName = "Textarea";
