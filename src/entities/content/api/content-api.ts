import { apiClient, createQueryKeys, type QueryParams } from "@/shared/api";
import type { ContentPayload } from "../model/form";
import type { ContentFilters, ContentItem, ContentListParams, Genre, Page } from "../model/types";

export const contentKeys = {
    ...createQueryKeys("content"),
    /** Each "another one" click is a new key, so React Query fetches a fresh pick. */
    random: (filters: ContentFilters, attempt: number) =>
        ["content", "random", filters, attempt] as const,
    genres: () => ["genres"] as const,
};

const asQuery = (params: ContentFilters | ContentListParams) => params as QueryParams;

export const contentApi = {
    list: (params: ContentListParams, signal?: AbortSignal) =>
        apiClient.get<Page<ContentItem>>("/content", { query: asQuery(params), signal }),
    random: (filters: ContentFilters, signal?: AbortSignal) =>
        apiClient.get<ContentItem>("/content/random", { query: asQuery(filters), signal }),
    byId: (id: number, signal?: AbortSignal) =>
        apiClient.get<ContentItem>(`/content/${id}`, { signal }),
    genres: () => apiClient.get<Genre[]>("/genres"),
    /** Manually added content; the signed-in user becomes its author. */
    create: (payload: ContentPayload) => apiClient.post<ContentItem>("/content", payload),
    /** Full replacement (PUT); only the author may do it. */
    replace: (id: number, payload: ContentPayload) =>
        apiClient.put<ContentItem>(`/content/${id}`, payload),
};
