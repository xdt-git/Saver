import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../button";
import styles from "./listing.module.scss";

interface FilterBarProps {
    label: string;
    /** Tabs above the fields (categories, statuses). */
    tabs?: ReactNode;
    children: ReactNode;
    /** When set, a "reset filters" button is shown. */
    onReset?: () => void;
}

/** Filter area of a listing screen: tabs, a wrapping row of fields, an optional reset. */
export const FilterBar = ({ label, tabs, children, onReset }: FilterBarProps) => {
    const { t } = useTranslation();
    return (
        <section className={styles.filters} aria-label={label}>
            {tabs}
            <div className={styles.fields}>{children}</div>
            {onReset && (
                <Button variant="secondary" className={styles.reset} onClick={onReset}>
                    {t("discover.reset")}
                </Button>
            )}
        </section>
    );
};

/** Responsive grid of cards; marked busy while loading. */
export const CardGrid = ({ children, busy }: { children: ReactNode; busy?: boolean }) => (
    <div className={styles.grid} aria-busy={busy || undefined}>
        {children}
    </div>
);

interface ListingResultsProps {
    total: number;
    /** The previous page is still shown while the next one loads: dimmed. */
    stale: boolean;
    children: ReactNode;
    /** Paging under the grid. */
    footer?: ReactNode;
}

/** Loading state with the same layout as the results, so nothing jumps when they arrive. */
export const ListingSkeleton = ({ children }: { children: ReactNode }) => (
    <div className={styles.results} aria-busy="true">
        <p className={styles.found} aria-hidden="true">
            &nbsp;
        </p>
        <CardGrid busy>{children}</CardGrid>
    </div>
);

/** "Found: N", the cards and the paging. */
export const ListingResults = ({ total, stale, children, footer }: ListingResultsProps) => {
    const { t } = useTranslation();
    return (
        <div className={styles.results} aria-busy={stale}>
            <p className={styles.found}>{t("discover.found", { total })}</p>
            <CardGrid>{children}</CardGrid>
            {footer}
        </div>
    );
};
