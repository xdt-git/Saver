import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { GenreSelect, useContentLabels } from "@/entities/content";
import { RATING_VALUES } from "@/shared/config/content";
import { Input } from "@/shared/ui/input";
import { FilterBar, filterFieldClassNames as fields } from "@/shared/ui/listing";
import { SearchInput } from "@/shared/ui/search-input";
import { SegmentedControl } from "@/shared/ui/segmented-control";
import { Select } from "@/shared/ui/select";
import {
    CATEGORY_TABS,
    EMPTY_FILTERS,
    SORT_KEYS,
    type CatalogFilters as Filters,
    type SortKey,
} from "../model/filters";

interface CatalogFiltersProps {
    value: Filters;
    /** Called with the changed fields; any filter change goes back to page 1. */
    onChange: (patch: Partial<Filters>) => void;
}

const ALL = "all";
const YEAR_MIN = 1870;
const YEAR_MAX = 2100;

const toNumber = (raw: string) => (raw === "" ? undefined : Number(raw));

/** Category tabs, search with debounce, genre, years, minimum rating and sorting. */
export const CatalogFilters = ({ value, onChange }: CatalogFiltersProps) => {
    const { t } = useTranslation();
    const labels = useContentLabels();

    const set = (patch: Partial<Filters>) => onChange({ ...patch, page: 1 });
    const yearInput = (key: "yearFrom" | "yearTo") => ({
        type: "number",
        inputMode: "numeric" as const,
        min: YEAR_MIN,
        max: YEAR_MAX,
        fieldClassName: fields.field,
        label: t(`discover.${key}`),
        value: value[key] ?? "",
        onChange: (event: ChangeEvent<HTMLInputElement>) =>
            set({ [key]: toNumber(event.target.value) }),
    });

    const isFiltered =
        value.search !== "" ||
        value.type !== undefined ||
        value.genre !== undefined ||
        value.yearFrom !== undefined ||
        value.yearTo !== undefined ||
        value.minRating !== undefined;

    return (
        <FilterBar
            label={t("discover.title")}
            onReset={
                isFiltered ? () => onChange({ ...EMPTY_FILTERS, sort: value.sort }) : undefined
            }
            tabs={
                <SegmentedControl
                    ariaLabel={t("discover.categories")}
                    value={value.type ?? ALL}
                    onChange={(type) => set({ type: type === ALL ? undefined : type })}
                    options={[
                        { value: ALL, label: t("discover.all") },
                        ...CATEGORY_TABS.map((type) => ({ value: type, label: labels.type(type) })),
                    ]}
                />
            }
        >
            <SearchInput
                fieldClassName={fields.search}
                label={t("discover.search")}
                placeholder={t("discover.searchPlaceholder")}
                value={value.search}
                onSearch={(search) => set({ search })}
            />
            <GenreSelect
                fieldClassName={fields.field}
                value={value.genre}
                onChange={(genre) => set({ genre })}
            />
            <Input {...yearInput("yearFrom")} />
            <Input {...yearInput("yearTo")} />
            <Select
                fieldClassName={fields.field}
                label={t("discover.minRating")}
                placeholder={t("discover.anyRating")}
                value={value.minRating ?? ""}
                onChange={(event) => set({ minRating: toNumber(event.target.value) })}
                options={RATING_VALUES.map((rating) => ({
                    value: String(rating),
                    label: `★ ${rating}+`,
                }))}
            />
            <Select
                fieldClassName={fields.field}
                label={t("discover.sort")}
                value={value.sort}
                onChange={(event) => onChange({ sort: event.target.value as SortKey, page: 1 })}
                options={SORT_KEYS.map((key) => ({
                    value: key,
                    label: t(`discover.sorts.${key}`),
                }))}
            />
        </FilterBar>
    );
};
