import { useTranslation } from "react-i18next";
import { MdBookmarkBorder, MdSearchOff } from "react-icons/md";
import {
    ContentCard,
    ContentCardSkeleton,
    useContentLabels,
    type ContentItem,
} from "@/entities/content";
import { useLibrary, type LibraryEntry } from "@/entities/library";
import { EditContentButton } from "@/features/edit-content";
import { EditEntryButton } from "@/features/edit-library-entry";
import { RatePicker } from "@/features/rate-content";
import { RemoveEntryButton } from "@/features/remove-from-library";
import { StatusPicker } from "@/features/set-library-status";
import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { EmptyState, ErrorState } from "@/shared/ui/empty-state";
import { CardGrid, ListingResults } from "@/shared/ui/listing";
import { Pagination } from "@/shared/ui/pagination";
import {
    COLLECTION_PAGE_SIZE,
    isNarrowed,
    toLibraryParams,
    type CollectionFilters,
} from "../model/filters";
import styles from "./collection.module.scss";

type Entry = LibraryEntry<ContentItem>;

/** Notes and the completion date under the card text. */
const EntryDetails = ({ entry }: { entry: Entry }) => {
    const { t, i18n } = useTranslation();
    if (!entry.notes && !entry.completedAt) return null;
    return (
        <div className={styles.entryDetails}>
            {entry.completedAt && (
                <p>
                    {t("collection.completedOn", {
                        date: new Date(entry.completedAt).toLocaleDateString(i18n.language),
                    })}
                </p>
            )}
            {entry.notes && <p className={styles.notes}>{entry.notes}</p>}
        </div>
    );
};

const EntryActions = ({ entry }: { entry: Entry }) => (
    <>
        <StatusPicker item={entry.content} />
        <RatePicker item={entry.content} />
        <EditEntryButton entry={entry} title={entry.content.title} />
        <EditContentButton item={entry.content} />
        <RemoveEntryButton entryId={entry.id} title={entry.content.title} />
    </>
);

interface CollectionResultsProps {
    filters: CollectionFilters;
    onPageChange: (page: number) => void;
}

/** The user's entries as cards with all actions, paging, skeletons, empty and error states. */
export const CollectionResults = ({ filters, onPageChange }: CollectionResultsProps) => {
    const { t } = useTranslation();
    const labels = useContentLabels();
    const { data, isPending, isError, isPlaceholderData, refetch } = useLibrary<ContentItem>(
        toLibraryParams(filters),
    );

    if (isPending) {
        return (
            <CardGrid busy>
                {Array.from({ length: COLLECTION_PAGE_SIZE / 2 }, (_, index) => (
                    <ContentCardSkeleton key={index} />
                ))}
            </CardGrid>
        );
    }
    if (isError) {
        return <ErrorState title={t("collection.loadError")} onRetry={() => void refetch()} />;
    }
    if (data.total === 0) {
        return isNarrowed(filters) ? (
            <EmptyState
                icon={<MdSearchOff />}
                title={t("discover.emptyTitle")}
                description={t("discover.emptyText")}
            />
        ) : (
            <EmptyState
                icon={<MdBookmarkBorder />}
                title={
                    filters.status || filters.type
                        ? t("collection.emptyHere", {
                              what: [
                                  filters.type && labels.type(filters.type),
                                  filters.status && t(`library.status.${filters.status}`),
                              ]
                                  .filter(Boolean)
                                  .join(", "),
                          })
                        : t("collection.emptyTitle")
                }
                description={t("collection.emptyText")}
                action={
                    // Same category in the catalog, so the user finds something to add.
                    <Button
                        to={
                            filters.type
                                ? `${ROUTES.discover}?type=${filters.type}`
                                : ROUTES.discover
                        }
                        size="md"
                    >
                        {t("collection.toCatalog")}
                    </Button>
                }
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
            {data.items.map((entry) => (
                <ContentCard
                    key={entry.id}
                    item={entry.content}
                    extra={<EntryDetails entry={entry} />}
                    actions={<EntryActions entry={entry} />}
                />
            ))}
        </ListingResults>
    );
};
