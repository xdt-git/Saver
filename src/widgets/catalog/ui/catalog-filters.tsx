import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { useGenres, useContentLabels } from "@/entities/content";
import { RATING_VALUES } from "@/shared/config/content";
import { useDebouncedValue } from "@/shared/lib";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { SegmentedControl } from "@/shared/ui/segmented-control";
import { Select } from "@/shared/ui/select";
import {
    CATEGORY_TABS,
    EMPTY_FILTERS,
    SORT_KEYS,
    type CatalogFilters as Filters,
    type SortKey,
} from "../model/filters";
import styles from "./catalog.module.scss";

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
    const genres = useGenres();

    // The search box answers at once; the request waits until typing stops.
    const [search, setSearch] = useState(value.search);
    const debouncedSearch = useDebouncedValue(search);
    // Latest props without re-running the effect below on every render.
    const latest = useRef({ search: value.search, onChange });
    latest.current = { search: value.search, onChange };
    useEffect(() => setSearch(value.search), [value.search]);
    useEffect(() => {
        if (debouncedSearch !== latest.current.search) {
            latest.current.onChange({ search: debouncedSearch, page: 1 });
        }
    }, [debouncedSearch]);

    const set = (patch: Partial<Filters>) => onChange({ ...patch, page: 1 });
    const onYear = (key: "yearFrom" | "yearTo") => (event: ChangeEvent<HTMLInputElement>) =>
        set({ [key]: toNumber(event.target.value) });

    const isFiltered =
        value.search !== "" ||
        value.type !== undefined ||
        value.genre !== undefined ||
        value.yearFrom !== undefined ||
        value.yearTo !== undefined ||
        value.minRating !== undefined;

    return (
        <section className={styles.filters} aria-label={t("discover.title")}>
            <SegmentedControl
                className={styles.tabs}
                ariaLabel={t("discover.categories")}
                value={value.type ?? ALL}
                onChange={(type) => set({ type: type === ALL ? undefined : type })}
                options={[
                    { value: ALL, label: t("discover.all") },
                    ...CATEGORY_TABS.map((type) => ({ value: type, label: labels.type(type) })),
                ]}
            />
            <div className={styles.fields}>
                <Input
                    type="search"
                    fieldClassName={styles.searchField}
                    label={t("discover.search")}
                    placeholder={t("discover.searchPlaceholder")}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
                <Select
                    fieldClassName={styles.field}
                    label={t("discover.genre")}
                    placeholder={t("discover.anyGenre")}
                    value={value.genre ?? ""}
                    onChange={(event) => set({ genre: event.target.value || undefined })}
                    options={(genres.data ?? []).map((genre) => ({
                        value: genre.slug,
                        label: labels.genre(genre),
                    }))}
                />
                <Input
                    type="number"
                    inputMode="numeric"
                    min={YEAR_MIN}
                    max={YEAR_MAX}
                    fieldClassName={styles.field}
                    label={t("discover.yearFrom")}
                    value={value.yearFrom ?? ""}
                    onChange={onYear("yearFrom")}
                />
                <Input
                    type="number"
                    inputMode="numeric"
                    min={YEAR_MIN}
                    max={YEAR_MAX}
                    fieldClassName={styles.field}
                    label={t("discover.yearTo")}
                    value={value.yearTo ?? ""}
                    onChange={onYear("yearTo")}
                />
                <Select
                    fieldClassName={styles.field}
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
                    fieldClassName={styles.field}
                    label={t("discover.sort")}
                    value={value.sort}
                    onChange={(event) => onChange({ sort: event.target.value as SortKey, page: 1 })}
                    options={SORT_KEYS.map((key) => ({
                        value: key,
                        label: t(`discover.sorts.${key}`),
                    }))}
                />
            </div>
            {isFiltered && (
                <Button
                    variant="secondary"
                    className={styles.reset}
                    onClick={() => onChange({ ...EMPTY_FILTERS, sort: value.sort })}
                >
                    {t("discover.reset")}
                </Button>
            )}
        </section>
    );
};
