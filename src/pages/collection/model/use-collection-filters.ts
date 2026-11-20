import {
    COLLECTION_SORT_KEYS,
    DEFAULT_COLLECTION_SORT,
    type CollectionFiltersValue as Filters,
} from "@/widgets/collection";
import { CONTENT_TYPES, LIBRARY_STATUSES } from "@/shared/config/content";
import { intParam, oneOfParam, toSearchParams, useUrlState } from "@/shared/lib";

/** ?status=&type=&genre=&q=&sort=&page=; broken values are ignored. */
export const parseCollectionFilters = (params: URLSearchParams): Filters => ({
    status: oneOfParam(params.get("status"), LIBRARY_STATUSES),
    type: oneOfParam(params.get("type"), CONTENT_TYPES),
    genre: params.get("genre") || undefined,
    search: params.get("q") ?? "",
    sort: oneOfParam(params.get("sort"), COLLECTION_SORT_KEYS) ?? DEFAULT_COLLECTION_SORT,
    page: Math.max(1, intParam(params.get("page")) ?? 1),
});

export const serializeCollectionFilters = (filters: Filters) =>
    toSearchParams({
        status: filters.status,
        type: filters.type,
        genre: filters.genre,
        q: filters.search.trim(),
        sort: filters.sort === DEFAULT_COLLECTION_SORT ? undefined : filters.sort,
        page: filters.page > 1 ? filters.page : undefined,
    });

export const useCollectionFilters = () =>
    useUrlState(parseCollectionFilters, serializeCollectionFilters);
