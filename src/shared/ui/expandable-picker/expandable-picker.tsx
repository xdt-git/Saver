import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn, useClickOutside, useEscapeKey } from "@/shared/lib";
import { Button } from "../button";
import { SegmentedControl, type SegmentedOption } from "../segmented-control";
import styles from "./expandable-picker.module.scss";

export interface ExpandablePickerProps<T extends string> {
    /** Icon shown while collapsed (e.g. a globe for the language). */
    icon: ReactNode;
    /** Accessible name of the trigger and of the options group. */
    label: string;
    options: readonly SegmentedOption<T>[];
    value: T | undefined;
    onChange: (value: T) => void;
    className?: string;
}

/**
 * A round icon button; pressing it hides the icon and shows the options in its place.
 * Picking an option, Escape or a click outside collapses it back.
 */
export const ExpandablePicker = <T extends string>({
    icon,
    label,
    options,
    value,
    onChange,
    className,
}: ExpandablePickerProps<T>) => {
    const [isOpen, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const close = () => setOpen(false);

    useEscapeKey(isOpen, close);
    useClickOutside(rootRef, isOpen, close);

    // Move focus to the selected option when opened, so keyboard users land on it.
    useEffect(() => {
        if (!isOpen) return;
        const root = rootRef.current;
        const target =
            root?.querySelector<HTMLElement>('[aria-pressed="true"]') ??
            root?.querySelector<HTMLElement>("[aria-pressed]");
        target?.focus();
    }, [isOpen]);

    return (
        <div ref={rootRef} className={cn(styles.picker, isOpen && styles.open, className)}>
            {isOpen ? (
                <SegmentedControl<T>
                    className={styles.options}
                    options={options}
                    value={value}
                    ariaLabel={label}
                    onChange={(next) => {
                        onChange(next);
                        close();
                    }}
                />
            ) : (
                <Button
                    variant="icon"
                    className={styles.trigger}
                    aria-label={label}
                    aria-expanded={false}
                    title={label}
                    onClick={() => setOpen(true)}
                >
                    {icon}
                </Button>
            )}
        </div>
    );
};
