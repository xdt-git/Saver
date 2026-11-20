import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient, createQueryKeys, type QueryParams } from "@/shared/api";
import type { ContentType, LibraryStatus } from "@/shared/config/content";

export const libraryKeys = createQueryKeys("library");

export const LIBRARY_SORTS = ["updatedAt", "createdAt", "title"] as const;
export type LibrarySort = (typeof LIBRARY_SORTS)[number];

/**
 * A library entry. `C` is the content shape (the catalog item from entities/content);
 * it is a parameter because entities do not import each other (FSD).
 */
export interface LibraryEntry<C = unknown> {
    id: number;
    status: LibraryStatus;
    notes: string | null;
    startedAt: string | null;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
    content: C;
}

export interface LibraryListParams {
    status?: LibraryStatus;
    type?: ContentType;
    genre?: string;
    search?: string;
    sort?: LibrarySort;
    order?: "asc" | "desc";
    page?: number;
    pageSize?: number;
}

export interface LibraryEntryPatch {
    status?: LibraryStatus;
    notes?: string | null;
    /** ISO date; only for completed entries. */
    completedAt?: string;
}

export interface LibraryPage<C> {
    items: LibraryEntry<C>[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

export const libraryApi = {
    list: <C>(params: LibraryListParams, signal?: AbortSignal) =>
        apiClient.get<LibraryPage<C>>("/library", { query: params as QueryParams, signal }),
    add: (contentId: number, status: LibraryStatus) =>
        apiClient.post<LibraryEntry>("/library", { contentId, status }),
    setStatus: (entryId: number, status: LibraryStatus) =>
        apiClient.patch<LibraryEntry>(`/library/${entryId}`, { status }),
    update: (entryId: number, patch: LibraryEntryPatch) =>
        apiClient.patch<LibraryEntry>(`/library/${entryId}`, patch),
    remove: (entryId: number) => apiClient.delete(`/library/${entryId}`),
};

/** One page of the signed-in user's library; the previous page stays while the next loads. */
export const useLibrary = <C>(params: LibraryListParams) =>
    useQuery({
        queryKey: libraryKeys.list({ ...params }),
        queryFn: ({ signal }) => libraryApi.list<C>(params, signal),
        placeholderData: keepPreviousData,
    });
