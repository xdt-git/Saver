import { DEFAULT_SORT, SORT_KEYS, type CatalogFiltersValue as Filters } from "@/widgets/catalog";
import { CONTENT_TYPES } from "@/shared/config/content";
import { intParam, oneOfParam, toSearchParams, useUrlState } from "@/shared/lib";

/** Reads filters from ?q=&type=&genre=&from=&to=&rating=&sort=&page=; bad values are ignored. */
export const parseFilters = (params: URLSearchParams): Filters => ({
    search: params.get("q") ?? "",
    type: oneOfParam(params.get("type"), CONTENT_TYPES),
    genre: params.get("genre") || undefined,
    yearFrom: intParam(params.get("from")),
    yearTo: intParam(params.get("to")),
    minRating: intParam(params.get("rating")),
    sort: oneOfParam(params.get("sort"), SORT_KEYS) ?? DEFAULT_SORT,
    page: Math.max(1, intParam(params.get("page")) ?? 1),
});

/** Writes only what differs from the defaults, so a clean catalog has a clean URL. */
export const serializeFilters = (filters: Filters) =>
    toSearchParams({
        q: filters.search.trim(),
        type: filters.type,
        genre: filters.genre,
        from: filters.yearFrom,
        to: filters.yearTo,
        rating: filters.minRating,
        sort: filters.sort === DEFAULT_SORT ? undefined : filters.sort,
        page: filters.page > 1 ? filters.page : undefined,
    });

/** Catalog filters kept in the URL. */
export const useUrlFilters = () => useUrlState(parseFilters, serializeFilters);
