import { useTranslation } from "react-i18next";
import { CollectionFilters, CollectionResults } from "@/widgets/collection";
import { AddContentButton } from "@/features/add-content";
import { ContentPage } from "@/shared/ui/content-page";
import { useCollectionFilters } from "../model/use-collection-filters";

/** The signed-in user's library: status tabs, filters, cards with all actions, manual add. */
export const CollectionPage = () => {
    const { t } = useTranslation();
    const [filters, update] = useCollectionFilters();

    return (
        <ContentPage
            title={t("collection.title")}
            actions={<AddContentButton defaultStatus={filters.status} defaultType={filters.type} />}
        >
            <CollectionFilters value={filters} onChange={update} />
            <CollectionResults
                filters={filters}
                onPageChange={(page) => {
                    update({ page });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }}
            />
        </ContentPage>
    );
};
