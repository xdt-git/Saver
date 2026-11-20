import { useInfiniteQuery, type InfiniteData, type QueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api";
import type { ActivityPage, ActivityUser } from "./activity-api";
import { activityKeys } from "./activity-api";

export interface ActivityComment {
    id: number;
    activityId: number;
    text: string;
    createdAt: string;
    user: ActivityUser;
}

export interface ActivitySocial {
    likes: number;
    /** Whether the signed-in user liked it (false for guests). */
    liked: boolean;
    comments: number;
    /** The newest comments, oldest first. */
    latestComments: ActivityComment[];
}

export interface CommentPage {
    items: ActivityComment[];
    nextCursor: number | null;
}

export const COMMENT_MAX = 500;
const COMMENT_PAGE = 50;

export const socialKeys = {
    comments: (activityId: number) => ["activity-comments", activityId] as const,
};

export const socialApi = {
    like: (id: number) => apiClient.put<{ likes: number; liked: boolean }>(`/activity/${id}/like`),
    unlike: (id: number) =>
        apiClient.delete<{ likes: number; liked: boolean }>(`/activity/${id}/like`),
    comments: (id: number, after?: number, signal?: AbortSignal) =>
        apiClient.get<CommentPage>(`/activity/${id}/comments`, {
            query: { after, limit: COMMENT_PAGE },
            signal,
        }),
    addComment: (id: number, text: string) =>
        apiClient.post<ActivityComment>(`/activity/${id}/comments`, { text }),
    deleteComment: (commentId: number) => apiClient.delete(`/activity/comments/${commentId}`),
};

/** Every comment of an event, oldest first, loaded when "more" is opened. */
export const useActivityComments = (activityId: number, enabled: boolean) =>
    useInfiniteQuery({
        queryKey: socialKeys.comments(activityId),
        queryFn: ({ pageParam, signal }) => socialApi.comments(activityId, pageParam, signal),
        initialPageParam: undefined as number | undefined,
        getNextPageParam: (last) => last.nextCursor ?? undefined,
        enabled,
    });

/** Changes one event's likes / comments in every cached feed that shows it. */
export const updateSocialInCache = (
    queryClient: QueryClient,
    activityId: number,
    change: (social: ActivitySocial) => ActivitySocial,
) =>
    queryClient.setQueriesData<InfiniteData<ActivityPage>>(
        { queryKey: activityKeys.all },
        (data) =>
            data?.pages
                ? {
                      ...data,
                      pages: data.pages.map((page) => ({
                          ...page,
                          items: page.items.map((item) =>
                              item.id === activityId
                                  ? { ...item, social: change(item.social) }
                                  : item,
                          ),
                      })),
                  }
                : data,
    );
