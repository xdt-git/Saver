import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CatalogFilters, CatalogResults, RandomPick } from "@/widgets/catalog";
import { TmdbSearch } from "@/features/tmdb-import";
import { ContentPage } from "@/shared/ui/content-page";
import { useUrlFilters } from "../model/use-url-filters";

/** Catalog with search, filters, paging and a random pick that respects the filters. */
export const DiscoverPage = () => {
    const { t } = useTranslation();
    const [filters, update] = useUrlFilters();

    // Each visit gets its own shuffle: a fresh seed goes into the URL (without a history
    // entry), so paging and coming back from a title keep the same order.
    useEffect(() => {
        if (filters.sort === "shuffled" && filters.seed === undefined) {
            update({ seed: Math.floor(Math.random() * 2_147_483_647) }, { replace: true });
        }
    }, [filters.sort, filters.seed, update]);

    return (
        <ContentPage title={t("discover.title")} actions={<RandomPick filters={filters} />}>
            <CatalogFilters value={filters} onChange={update} />
            <CatalogResults
                filters={filters}
                onPageChange={(page) => {
                    update({ page });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }}
            />
            <TmdbSearch initialQuery={filters.search} />
        </ContentPage>
    );
};
