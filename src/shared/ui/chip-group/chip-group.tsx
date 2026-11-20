import { cn } from "@/shared/lib";
import styles from "./chip-group.module.scss";

export interface ChipOption {
    value: string;
    label: string;
}

export interface ChipGroupProps {
    options: ChipOption[];
    /** Selected values. */
    value: string[];
    onChange: (value: string[]) => void;
    label: string;
    error?: string;
    /** No more than this many can be selected; the rest are disabled. */
    max?: number;
}

/** Pick several options (genres). Each chip is a toggle button with aria-pressed. */
export const ChipGroup = ({ options, value, onChange, label, error, max }: ChipGroupProps) => {
    const full = max !== undefined && value.length >= max;
    const toggle = (option: string) =>
        onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);

    return (
        <fieldset className={styles.group} aria-invalid={error ? true : undefined}>
            <legend className={styles.legend}>{label}</legend>
            <div className={styles.chips}>
                {options.map((option) => {
                    const selected = value.includes(option.value);
                    return (
                        <button
                            key={option.value}
                            type="button"
                            aria-pressed={selected}
                            disabled={!selected && full}
                            className={cn(styles.chip, selected && styles.selected)}
                            onClick={() => toggle(option.value)}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
            {error && (
                <span role="alert" className={styles.error}>
                    {error}
                </span>
            )}
        </fieldset>
    );
};
