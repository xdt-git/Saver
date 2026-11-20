import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/api";
import type { FollowListKind, ProfilePatch, PublicProfile, UserPage } from "../model/types";

export const userKeys = {
    all: ["users"] as const,
    profile: (id: number) => ["users", "profile", id] as const,
    follows: (id: number, kind: FollowListKind, page: number) => ["users", kind, id, page] as const,
    search: (query: string) => ["users", "search", query] as const,
};

export const USER_SEARCH_LIMIT = 10;

export const FOLLOW_PAGE_SIZE = 20;

export const userApi = {
    profile: (id: number, signal?: AbortSignal) =>
        apiClient.get<PublicProfile>(`/users/${id}`, { signal }),
    /** Returns the signed-in user's own data (same shape as the session user). */
    updateMe: <T>(patch: ProfilePatch) => apiClient.patch<T>("/users/me", patch),
    follow: (id: number) => apiClient.post<null>(`/users/${id}/follow`),
    unfollow: (id: number) => apiClient.delete(`/users/${id}/follow`),
    /** People by name or @username (public data only). */
    search: (query: string, signal?: AbortSignal) =>
        apiClient.get<PublicProfile[]>("/users", {
            query: { search: query, limit: USER_SEARCH_LIMIT },
            signal,
        }),
    follows: (id: number, kind: FollowListKind, page: number, signal?: AbortSignal) =>
        apiClient.get<UserPage>(`/users/${id}/${kind}`, {
            query: { page, pageSize: FOLLOW_PAGE_SIZE },
            signal,
        }),
};

export const useProfile = (id: number) =>
    useQuery({
        queryKey: userKeys.profile(id),
        queryFn: ({ signal }) => userApi.profile(id, signal),
    });

/** Empty text asks nothing; the previous results stay while the next ones load. */
export const useUserSearch = (query: string) => {
    const text = query.trim();
    return useQuery({
        queryKey: userKeys.search(text.toLowerCase()),
        queryFn: ({ signal }) => userApi.search(text, signal),
        enabled: text.length > 0,
        placeholderData: keepPreviousData,
    });
};

export const useFollowList = (id: number, kind: FollowListKind, page: number, enabled = true) =>
    useQuery({
        queryKey: userKeys.follows(id, kind, page),
        queryFn: ({ signal }) => userApi.follows(id, kind, page, signal),
        placeholderData: keepPreviousData,
        enabled,
    });
