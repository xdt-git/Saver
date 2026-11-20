import type { LibraryListParams, LibrarySort } from "@/entities/library";
import type { ContentType, LibraryStatus } from "@/shared/config/content";

/** Sort choices of the library, mapped to the API's sort and order. */
export const COLLECTION_SORTS = {
    updated: { sort: "updatedAt", order: "desc" },
    added: { sort: "createdAt", order: "desc" },
    title: { sort: "title", order: "asc" },
} as const satisfies Record<string, { sort: LibrarySort; order: "asc" | "desc" }>;

export type CollectionSortKey = keyof typeof COLLECTION_SORTS;
export const COLLECTION_SORT_KEYS = Object.keys(COLLECTION_SORTS) as CollectionSortKey[];
export const DEFAULT_COLLECTION_SORT: CollectionSortKey = "updated";
export const COLLECTION_PAGE_SIZE = 12;

/** What the library screen can be filtered by (kept in the URL by the page). */
export interface CollectionFilters {
    status?: LibraryStatus;
    type?: ContentType;
    genre?: string;
    search: string;
    sort: CollectionSortKey;
    page: number;
}

export const EMPTY_COLLECTION_FILTERS: CollectionFilters = {
    search: "",
    sort: DEFAULT_COLLECTION_SORT,
    page: 1,
};

/**
 * True when a search or a genre narrows the list. Status and type are where the user is
 * (tabs, category cards), not a search: an empty result there means "nothing added yet".
 */
export const isNarrowed = (f: CollectionFilters) => f.search.trim() !== "" || f.genre !== undefined;

export const toLibraryParams = (f: CollectionFilters): LibraryListParams => ({
    status: f.status,
    type: f.type,
    genre: f.genre,
    search: f.search.trim() || undefined,
    ...COLLECTION_SORTS[f.sort],
    page: f.page,
    pageSize: COLLECTION_PAGE_SIZE,
});
