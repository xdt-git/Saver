import { forwardRef, useId, type SelectHTMLAttributes } from "react";
import { cn } from "@/shared/lib";
import { FormField, controlClassNames, describedBy } from "../form-field";

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    options: SelectOption[];
    label?: string;
    hint?: string;
    error?: string;
    /** Text of an empty first option, e.g. "Choose a genre". */
    placeholder?: string;
}

/** Native select with the same look and messages as Input. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ options, label, hint, error, placeholder, id, className, ...rest }, ref) => {
        const autoId = useId();
        const selectId = id ?? autoId;

        return (
            <FormField id={selectId} label={label} hint={hint} error={error}>
                <select
                    ref={ref}
                    id={selectId}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy(selectId, hint, error)}
                    className={cn(
                        controlClassNames.control,
                        error && controlClassNames.invalid,
                        className,
                    )}
                    {...rest}
                >
                    {placeholder !== undefined && <option value="">{placeholder}</option>}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </FormField>
        );
    },
);

Select.displayName = "Select";
