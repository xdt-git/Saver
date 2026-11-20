import { useQuery } from "@tanstack/react-query";
import type { TmdbResult } from "@/entities/content";
import { apiClient } from "@/shared/api";

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
