import type { ContentType, LibraryStatus } from "@/shared/config/content";

export type { ContentType, LibraryStatus };

export const CONTENT_SORTS = [
    "popularity",
    "createdAt",
    "title",
    "releaseYear",
    "rating",
    "imdbRating",
] as const;
export type ContentSort = (typeof CONTENT_SORTS)[number];
export type SortOrder = "asc" | "desc";

export interface Genre {
    slug: string;
    name: string;
}

/** The signed-in user's own state for an item; null for guests. */
export interface ViewerState {
    libraryEntryId: number | null;
    status: LibraryStatus | null;
    rating: number | null;
}

/** Ratings from outside catalogs, null where the title has none. */
export interface ExternalRatings {
    imdb: { id: string; rating: number | null; votes: number | null } | null;
    tmdb: { rating: number; votes: number } | null;
    shikimori: { id: number; rating: number | null } | null;
}

/** A catalog item as GET /content returns it. */
export interface ContentItem {
    id: number;
    type: ContentType;
    title: string;
    originalTitle: string | null;
    /** English title when it differs (catalog titles). */
    titleEn: string | null;
    description: string | null;
    posterUrl: string | null;
    releaseYear: number | null;
    runtimeMinutes: number | null;
    episodeCount: number | null;
    episodeRuntimeMinutes: number | null;
    source: "manual" | "tmdb";
    genres: Genre[];
    /** Saver users' own rating. */
    rating: { average: number | null; count: number };
    externalRatings: ExternalRatings;
    popularity: number;
    createdById: number | null;
    createdAt: string;
    updatedAt: string;
    viewer: ViewerState | null;
}

export interface Page<T> {
    items: T[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

/** Filters shared by the catalog list and the random pick (API query names). */
export interface ContentFilters {
    search?: string;
    type?: ContentType;
    genre?: string;
    yearFrom?: number;
    yearTo?: number;
    minRating?: number;
}

export interface ContentListParams extends ContentFilters {
    page?: number;
    pageSize?: number;
    sort?: ContentSort;
    order?: SortOrder;
}
