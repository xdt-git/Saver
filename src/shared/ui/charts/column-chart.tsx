import { useState } from "react";
import { cn } from "@/shared/lib";
import styles from "./charts.module.scss";

export interface ColumnItem {
    key: string;
    /** Short axis label, e.g. "Nov". */
    label: string;
    /** Full name for the tooltip and the table, e.g. "November 2026". */
    fullLabel: string;
    value: number;
}

export interface ColumnChartProps {
    items: ColumnItem[];
    /** Chart title, also its accessible name. */
    label: string;
    /** Value as text, e.g. "3 completed". */
    formatValue: (value: number) => string;
    /** Header of the value column in the table view. */
    valueHeader: string;
    /** Summary of the <details> table view. */
    tableLabel: string;
}

/**
 * Single-series columns over time: thin columns (<= 24px) growing from one baseline with
 * 4px rounded tops, hover / focus tooltip per column, only the peak labeled, and a table
 * view for exact values and screen readers.
 */
export const ColumnChart = ({
    items,
    label,
    formatValue,
    valueHeader,
    tableLabel,
}: ColumnChartProps) => {
    const [active, setActive] = useState<string | null>(null);
    const max = Math.max(0, ...items.map((item) => item.value));
    const peak = max > 0 ? items.findIndex((item) => item.value === max) : -1;

    return (
        <figure className={styles.columnFigure}>
            <div className={styles.columns} role="group" aria-label={label}>
                {items.map((item, index) => {
                    const isActive = active === item.key;
                    return (
                        <button
                            key={item.key}
                            type="button"
                            className={cn(styles.slot, isActive && styles.slotActive)}
                            aria-label={`${item.fullLabel}: ${formatValue(item.value)}`}
                            onMouseEnter={() => setActive(item.key)}
                            onMouseLeave={() => setActive(null)}
                            onFocus={() => setActive(item.key)}
                            onBlur={() => setActive(null)}
                        >
                            <span className={styles.columnArea}>
                                {index === peak && !isActive && (
                                    <span className={styles.peakLabel} aria-hidden="true">
                                        {item.value}
                                    </span>
                                )}
                                {item.value > 0 && (
                                    <span
                                        className={styles.column}
                                        ref={(node) =>
                                            node?.style.setProperty(
                                                "--column-share",
                                                String(item.value / max),
                                            )
                                        }
                                    />
                                )}
                                {isActive && (
                                    <span className={styles.tooltip} role="tooltip">
                                        <span className={styles.tooltipTitle}>
                                            {item.fullLabel}
                                        </span>
                                        {formatValue(item.value)}
                                    </span>
                                )}
                            </span>
                            <span className={styles.axisLabel} aria-hidden="true">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
            <details className={styles.tableView}>
                <summary>{tableLabel}</summary>
                <table>
                    <thead>
                        <tr>
                            <th scope="col">{label}</th>
                            <th scope="col">{valueHeader}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.key}>
                                <th scope="row">{item.fullLabel}</th>
                                <td>{item.value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </details>
        </figure>
    );
};
