import { useTranslation } from "react-i18next";
import { CatalogFilters, CatalogResults, RandomPick } from "@/widgets/catalog";
import { Text } from "@/shared/ui/text";
import { useUrlFilters } from "../model/use-url-filters";
import styles from "./discover-page.module.scss";

/** Catalog with search, filters, paging and a random pick that respects the filters. */
export const DiscoverPage = () => {
    const { t } = useTranslation();
    const [filters, update] = useUrlFilters();

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <Text as="h1" glow className={styles.title}>
                    {t("discover.title")}
                </Text>
                <RandomPick filters={filters} />
            </div>
            <CatalogFilters value={filters} onChange={update} />
            <CatalogResults
                filters={filters}
                onPageChange={(page) => {
                    update({ page });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }}
            />
        </main>
    );
};
