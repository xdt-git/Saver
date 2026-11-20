import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contentKeys, type ContentItem } from "@/entities/content";
import { apiClient } from "@/shared/api";
import type { ContentType } from "@/shared/config/content";

export type TmdbMediaType = "movie" | "tv";

/** A TMDB hit before import (GET /tmdb/search). */
export interface TmdbResult {
    tmdbId: number;
    mediaType: TmdbMediaType;
    type: ContentType;
    title: string;
    originalTitle: string | null;
    releaseYear: number | null;
    overview: string | null;
    posterUrl: string | null;
    /** Our content id when the item is already in the catalog. */
    contentId: number | null;
}

export interface TmdbSearchPage {
    items: TmdbResult[];
    page: number;
    totalPages: number;
}

export const tmdbKeys = {
    status: () => ["tmdb", "status"] as const,
    search: (query: string, language: string, page: number) =>
        ["tmdb", "search", query, language, page] as const,
};

/** Whether the server has a TMDB token; the block is hidden when it has none. */
export const useTmdbStatus = () =>
    useQuery({
        queryKey: tmdbKeys.status(),
        queryFn: () => apiClient.get<{ enabled: boolean }>("/tmdb/status"),
        staleTime: Infinity,
    });

export const useTmdbSearch = (query: string, language: string, page: number, enabled: boolean) =>
    useQuery({
        queryKey: tmdbKeys.search(query, language, page),
        queryFn: ({ signal }) =>
            apiClient.get<TmdbSearchPage>("/tmdb/search", {
                query: { query, language, page },
                signal,
            }),
        enabled: enabled && query.trim().length > 0,
        staleTime: 5 * 60_000,
    });

/** Imports once (the API returns the existing item the second time) and refreshes the catalog. */
export const useTmdbImport = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (hit: Pick<TmdbResult, "mediaType" | "tmdbId">) =>
            apiClient.post<ContentItem>("/tmdb/import", {
                mediaType: hit.mediaType,
                tmdbId: hit.tmdbId,
            }),
        onSuccess: (item) => {
            queryClient.setQueryData(contentKeys.detail(item.id), item);
            void queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
            void queryClient.invalidateQueries({ queryKey: ["tmdb", "search"] });
        },
    });
};
