import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib";
import { FormField, controlClassNames, describedBy } from "../form-field";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    hint?: string;
    /** Error message; also marks the input as invalid. */
    error?: string;
    /** Class of the whole field (label + control); `className` styles the control itself. */
    fieldClassName?: string;
}

/** Text input with label, hint and error message. Forwards ref for form libraries. */
export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, hint, error, id, className, fieldClassName, ...rest }, ref) => {
        const autoId = useId();
        const inputId = id ?? autoId;

        return (
            <FormField
                id={inputId}
                label={label}
                hint={hint}
                error={error}
                className={fieldClassName}
            >
                <input
                    ref={ref}
                    id={inputId}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy(inputId, hint, error)}
                    className={cn(
                        controlClassNames.control,
                        error && controlClassNames.invalid,
                        className,
                    )}
                    {...rest}
                />
            </FormField>
        );
    },
);

Input.displayName = "Input";
