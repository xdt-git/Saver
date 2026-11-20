import { useTranslation } from "react-i18next";
import { Button } from "../button";
import styles from "./pagination.module.scss";

export interface PaginationProps {
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
    disabled?: boolean;
}

/** Previous / next with "Page X of Y". Hidden when everything fits on one page. */
export const Pagination = ({ page, totalPages, onChange, disabled = false }: PaginationProps) => {
    const { t } = useTranslation();
    if (totalPages <= 1) return null;

    return (
        <nav className={styles.pagination} aria-label={t("pagination.label")}>
            <Button
                variant="secondary"
                disabled={disabled || page <= 1}
                onClick={() => onChange(page - 1)}
            >
                {t("pagination.prev")}
            </Button>
            <span className={styles.status} aria-live="polite">
                {t("pagination.page", { page, pages: totalPages })}
            </span>
            <Button
                variant="secondary"
                disabled={disabled || page >= totalPages}
                onClick={() => onChange(page + 1)}
            >
                {t("pagination.next")}
            </Button>
        </nav>
    );
};
