import { useTranslation } from "react-i18next";
import { Button } from "../button";
import { pageItems } from "./page-items";
import styles from "./pagination.module.scss";

export interface PaginationProps {
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
    disabled?: boolean;
}

/**
 * Previous / next, page numbers around the current one plus the first and the last
 * (1 … 6 7 8 … 524), and "Page X of Y". Hidden when everything fits on one page.
 */
export const Pagination = ({ page, totalPages, onChange, disabled = false }: PaginationProps) => {
    const { t } = useTranslation();
    if (totalPages <= 1) return null;

    return (
        <nav className={styles.pagination} aria-label={t("pagination.label")}>
            <div className={styles.controls}>
                <Button
                    variant="secondary"
                    size="md"
                    disabled={disabled || page <= 1}
                    onClick={() => onChange(page - 1)}
                >
                    {t("pagination.prev")}
                </Button>
                <ul className={styles.pages}>
                    {pageItems(page, totalPages).map((item, index) =>
                        item === "gap" ? (
                            <li key={`gap-${index}`} className={styles.gap} aria-hidden="true">
                                …
                            </li>
                        ) : (
                            <li key={item}>
                                <Button
                                    variant={item === page ? "primary" : "secondary"}
                                    size="md"
                                    className={styles.number}
                                    disabled={disabled && item !== page}
                                    aria-current={item === page ? "page" : undefined}
                                    aria-label={t("pagination.goTo", { page: item })}
                                    onClick={() => item !== page && onChange(item)}
                                >
                                    {item}
                                </Button>
                            </li>
                        ),
                    )}
                </ul>
                <Button
                    variant="secondary"
                    size="md"
                    disabled={disabled || page >= totalPages}
                    onClick={() => onChange(page + 1)}
                >
                    {t("pagination.next")}
                </Button>
            </div>
            <span className={styles.status} aria-live="polite">
                {t("pagination.page", { page, pages: totalPages })}
            </span>
        </nav>
    );
};
