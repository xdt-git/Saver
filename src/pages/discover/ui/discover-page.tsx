import { useTranslation } from "react-i18next";
import { CatalogFilters, CatalogResults, RandomPick } from "@/widgets/catalog";
import { TmdbSearch } from "@/features/tmdb-import";
import { ContentPage } from "@/shared/ui/content-page";
import { useUrlFilters } from "../model/use-url-filters";

/** Catalog with search, filters, paging and a random pick that respects the filters. */
export const DiscoverPage = () => {
    const { t } = useTranslation();
    const [filters, update] = useUrlFilters();

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
