import type { ReactNode } from "react";
import styles from "./charts.module.scss";

export interface BarListItem {
    key: string;
    label: ReactNode;
    value: number;
    /** Text at the bar's tip; defaults to the number. */
    valueLabel?: string;
}

export interface BarListProps {
    items: BarListItem[];
    /** Accessible name of the whole list (the chart title). */
    label: string;
}

/**
 * Ranked horizontal bars in one hue (magnitude, not identity): a name, a bar on a shared
 * baseline and the value at its tip. Callers pass items in the order to show.
 */
export const BarList = ({ items, label }: BarListProps) => {
    const max = Math.max(1, ...items.map((item) => item.value));
    return (
        <ul className={styles.barList} aria-label={label}>
            {items.map((item) => (
                <li key={item.key} className={styles.barRow}>
                    <span className={styles.barName}>{item.label}</span>
                    <span className={styles.barTrack} aria-hidden="true">
                        {item.value > 0 && (
                            <span
                                className={styles.bar}
                                // Width is data, not style: it is set as a CSS variable.
                                ref={(node) =>
                                    node?.style.setProperty("--bar-share", String(item.value / max))
                                }
                            />
                        )}
                    </span>
                    <span className={styles.barValue}>{item.valueLabel ?? item.value}</span>
                </li>
            ))}
        </ul>
    );
};
