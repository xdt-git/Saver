import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
    DEFAULT_SORT,
    SORT_KEYS,
    type CatalogFiltersValue as Filters,
    type SortKey,
} from "@/widgets/catalog";
import { CONTENT_TYPES, type ContentType } from "@/shared/config/content";

const toInt = (raw: string | null) => {
    if (raw === null || raw === "") return undefined;
    const value = Number(raw);
    return Number.isInteger(value) ? value : undefined;
};

const pick = <T extends string>(raw: string | null, allowed: readonly T[]) =>
    allowed.includes(raw as T) ? (raw as T) : undefined;

/** Reads filters from ?q=&type=&genre=&from=&to=&rating=&sort=&page=; bad values are ignored. */
export const parseFilters = (params: URLSearchParams): Filters => ({
    search: params.get("q") ?? "",
    type: pick<ContentType>(params.get("type"), CONTENT_TYPES),
    genre: params.get("genre") || undefined,
    yearFrom: toInt(params.get("from")),
    yearTo: toInt(params.get("to")),
    minRating: toInt(params.get("rating")),
    sort: pick<SortKey>(params.get("sort"), SORT_KEYS) ?? DEFAULT_SORT,
    page: Math.max(1, toInt(params.get("page")) ?? 1),
});

/** Writes only what differs from the defaults, so a clean catalog has a clean URL. */
export const serializeFilters = (filters: Filters): URLSearchParams => {
    const params = new URLSearchParams();
    const put = (key: string, value: string | number | undefined) => {
        if (value !== undefined && value !== "") params.set(key, String(value));
    };
    put("q", filters.search.trim());
    put("type", filters.type);
    put("genre", filters.genre);
    put("from", filters.yearFrom);
    put("to", filters.yearTo);
    put("rating", filters.minRating);
    if (filters.sort !== DEFAULT_SORT) put("sort", filters.sort);
    if (filters.page > 1) put("page", filters.page);
    return params;
};

/** Catalog filters kept in the URL: shareable links, back button returns to the last filters. */
export const useUrlFilters = () => {
    const [params, setParams] = useSearchParams();
    const filters = useMemo(() => parseFilters(params), [params]);

    const update = useCallback(
        (patch: Partial<Filters>) => {
            setParams((current) => serializeFilters({ ...parseFilters(current), ...patch }));
        },
        [setParams],
    );

    return [filters, update] as const;
};
