import { useTranslation } from "react-i18next";
import { GenreSelect, useContentLabels } from "@/entities/content";
import { CONTENT_TYPES, LIBRARY_STATUSES, type ContentType } from "@/shared/config/content";
import { FilterBar, filterFieldClassNames as fields } from "@/shared/ui/listing";
import { SearchInput } from "@/shared/ui/search-input";
import { SegmentedControl } from "@/shared/ui/segmented-control";
import { Select } from "@/shared/ui/select";
import {
    COLLECTION_SORT_KEYS,
    isNarrowed,
    type CollectionFilters as Filters,
    type CollectionSortKey,
} from "../model/filters";

interface CollectionFiltersProps {
    value: Filters;
    onChange: (patch: Partial<Filters>) => void;
}

const ALL = "all";

/** Status tabs, then search, type, genre and sorting. Any change goes back to page 1. */
export const CollectionFilters = ({ value, onChange }: CollectionFiltersProps) => {
    const { t } = useTranslation();
    const labels = useContentLabels();
    const set = (patch: Partial<Filters>) => onChange({ ...patch, page: 1 });

    return (
        <FilterBar
            label={t("collection.filters")}
            onReset={
                isNarrowed(value) || value.type
                    ? () => set({ search: "", type: undefined, genre: undefined })
                    : undefined
            }
            tabs={
                <SegmentedControl
                    ariaLabel={t("collection.statusTabs")}
                    value={value.status ?? ALL}
                    onChange={(status) => set({ status: status === ALL ? undefined : status })}
                    options={[
                        { value: ALL, label: t("collection.allStatuses") },
                        ...LIBRARY_STATUSES.map((status) => ({
                            value: status,
                            label: t(`library.status.${status}`),
                        })),
                    ]}
                />
            }
        >
            <SearchInput
                fieldClassName={fields.search}
                label={t("discover.search")}
                value={value.search}
                onSearch={(search) => set({ search })}
            />
            <Select
                fieldClassName={fields.field}
                label={t("contentForm.type")}
                placeholder={t("collection.anyType")}
                value={value.type ?? ""}
                onChange={(event) =>
                    set({ type: (event.target.value || undefined) as ContentType | undefined })
                }
                options={CONTENT_TYPES.map((type) => ({ value: type, label: labels.type(type) }))}
            />
            <GenreSelect
                fieldClassName={fields.field}
                value={value.genre}
                onChange={(genre) => set({ genre })}
            />
            <Select
                fieldClassName={fields.field}
                label={t("discover.sort")}
                value={value.sort}
                onChange={(event) =>
                    onChange({ sort: event.target.value as CollectionSortKey, page: 1 })
                }
                options={COLLECTION_SORT_KEYS.map((key) => ({
                    value: key,
                    label: t(`collection.sorts.${key}`),
                }))}
            />
        </FilterBar>
    );
};
