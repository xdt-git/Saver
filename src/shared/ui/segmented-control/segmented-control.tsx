import type { ReactNode } from "react";
import { cn } from "@/shared/lib";
import { Button } from "../button";
import { glowClassName } from "../text";
import styles from "./segmented-control.module.scss";

export interface SegmentedOption<T extends string> {
    value: T;
    /** Visible text, or the accessible name when an icon is shown. */
    label: string;
    /** When set, the option shows this icon instead of the label text. */
    icon?: ReactNode;
}

export interface SegmentedControlProps<T extends string> {
    options: readonly SegmentedOption<T>[];
    value: T | undefined;
    onChange: (value: T) => void;
    /** Accessible name of the whole group, e.g. "Interface language". */
    ariaLabel: string;
    className?: string;
}

/** Pick one of a few options (language, theme). Each option is a nav-style toggle button. */
export const SegmentedControl = <T extends string>({
    options,
    value,
    onChange,
    ariaLabel,
    className,
}: SegmentedControlProps<T>) => (
    <div role="group" aria-label={ariaLabel} className={cn(styles.control, className)}>
        {options.map((option) => {
            const isActive = option.value === value;
            return (
                <Button
                    key={option.value}
                    variant="nav"
                    aria-pressed={isActive}
                    aria-label={option.icon ? option.label : undefined}
                    title={option.icon ? option.label : undefined}
                    className={cn(
                        isActive ? glowClassName : styles.inactive,
                        isActive && styles.active,
                    )}
                    onClick={() => onChange(option.value)}
                >
                    {option.icon ? (
                        <span className={styles.icon}>{option.icon}</span>
                    ) : (
                        option.label
                    )}
                </Button>
            );
        })}
    </div>
);
