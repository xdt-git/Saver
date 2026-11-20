import type { ContentListParams, ContentSort, SortOrder } from "@/entities/content";
import type { ContentType } from "@/shared/config/content";

/** Sort choices offered to the user, each mapped to the API's sort and order. */
export const SORT_OPTIONS = {
    newest: { sort: "createdAt", order: "desc" },
    title: { sort: "title", order: "asc" },
    year: { sort: "releaseYear", order: "desc" },
    rating: { sort: "rating", order: "desc" },
} as const satisfies Record<string, { sort: ContentSort; order: SortOrder }>;

export type SortKey = keyof typeof SORT_OPTIONS;
export const SORT_KEYS = Object.keys(SORT_OPTIONS) as SortKey[];
export const DEFAULT_SORT: SortKey = "newest";

/** Categories offered as tabs; "other" stays reachable through the API but not as a tab. */
export const CATEGORY_TABS = [
    "film",
    "series",
    "anime",
    "cartoon",
    "game",
] as const satisfies readonly ContentType[];

/** Everything the catalog screen can be filtered by (kept in the URL by the page). */
export interface CatalogFilters {
    search: string;
    type?: ContentType;
    genre?: string;
    yearFrom?: number;
    yearTo?: number;
    minRating?: number;
    sort: SortKey;
    page: number;
}

export const EMPTY_FILTERS: CatalogFilters = { search: "", sort: DEFAULT_SORT, page: 1 };

/** Filters without paging and sorting: what the random pick respects. */
export const toContentFilters = ({
    search,
    type,
    genre,
    yearFrom,
    yearTo,
    minRating,
}: CatalogFilters) => ({
    search: search.trim() || undefined,
    type,
    genre,
    yearFrom,
    yearTo,
    minRating,
});

export const PAGE_SIZE = 12;

export const toListParams = (filters: CatalogFilters): ContentListParams => ({
    ...toContentFilters(filters),
    ...SORT_OPTIONS[filters.sort],
    page: filters.page,
    pageSize: PAGE_SIZE,
});
