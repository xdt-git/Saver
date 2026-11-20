import { useTranslation } from "react-i18next";
import { MdSearchOff } from "react-icons/md";
import { ContentCard, ContentCardSkeleton, useContentList } from "@/entities/content";
import { EmptyState, ErrorState } from "@/shared/ui/empty-state";
import { ListingResults, ListingSkeleton } from "@/shared/ui/listing";
import { Pagination } from "@/shared/ui/pagination";
import { PAGE_SIZE, toListParams, type CatalogFilters } from "../model/filters";
import { CardActions } from "./card-actions";

interface CatalogResultsProps {
    filters: CatalogFilters;
    onPageChange: (page: number) => void;
}

/** Result grid with skeletons while loading, empty and error states and paging. */
export const CatalogResults = ({ filters, onPageChange }: CatalogResultsProps) => {
    const { t } = useTranslation();
    const { data, isPending, isError, isPlaceholderData, refetch } = useContentList(
        toListParams(filters),
    );

    if (isPending) {
        return (
            <ListingSkeleton>
                {Array.from({ length: PAGE_SIZE / 2 }, (_, index) => (
                    <ContentCardSkeleton key={index} />
                ))}
            </ListingSkeleton>
        );
    }
    if (isError) {
        return <ErrorState title={t("discover.loadError")} onRetry={() => void refetch()} />;
    }
    if (data.total === 0) {
        return (
            <EmptyState
                icon={<MdSearchOff />}
                title={t("discover.emptyTitle")}
                description={t("discover.emptyText")}
            />
        );
    }

    return (
        <ListingResults
            total={data.total}
            stale={isPlaceholderData}
            footer={
                <Pagination
                    page={data.page}
                    totalPages={data.totalPages}
                    onChange={onPageChange}
                    disabled={isPlaceholderData}
                />
            }
        >
            {data.items.map((item) => (
                <ContentCard key={item.id} item={item} actions={<CardActions item={item} />} />
            ))}
        </ListingResults>
    );
};
