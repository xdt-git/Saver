import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api";
import type { ContentType } from "@/shared/config/content";
import type { ContentItem } from "../model/types";
import { contentKeys } from "./content-api";

export type TmdbMediaType = "movie" | "tv";

/** A TMDB title before import (TMDB search, catalog suggestions). */
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
            void queryClient.invalidateQueries({ queryKey: contentKeys.suggestAll() });
        },
    });
};
