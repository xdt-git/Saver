import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Activity, ActivityUser } from "./activity-api";
import { apiClient } from "@/shared/api";

export type NotificationType = "activity" | "like" | "comment";

/** Someone you follow did something, or someone liked / commented your event. */
export interface AppNotification {
    id: number;
    type: NotificationType;
    createdAt: string;
    read: boolean;
    actor: ActivityUser;
    activity: Pick<Activity, "id" | "type" | "payload" | "content">;
    comment: { id: number; text: string } | null;
}

export interface NotificationPage {
    items: AppNotification[];
    nextCursor: number | null;
    unread: number;
}

export const NOTIFICATION_PAGE_SIZE = 20;
/** How often the header asks for the unread count. */
export const UNREAD_POLL_MS = 60_000;

export const notificationKeys = {
    all: ["notifications"] as const,
    list: () => ["notifications", "list"] as const,
    unread: () => ["notifications", "unread"] as const,
};

export const notificationApi = {
    page: (before: number | undefined, signal?: AbortSignal) =>
        apiClient.get<NotificationPage>("/notifications", {
            query: { before, limit: NOTIFICATION_PAGE_SIZE },
            signal,
        }),
    unreadCount: (signal?: AbortSignal) =>
        apiClient.get<{ count: number }>("/notifications/unread-count", { signal }),
    /** Without ids marks everything as read. */
    markRead: (ids?: number[]) =>
        apiClient.post<{ count: number }>("/notifications/read", ids ? { ids } : {}),
};

export const useNotifications = () =>
    useInfiniteQuery({
        queryKey: notificationKeys.list(),
        queryFn: ({ pageParam, signal }) => notificationApi.page(pageParam, signal),
        initialPageParam: undefined as number | undefined,
        getNextPageParam: (last) => last.nextCursor ?? undefined,
    });

/** Unread count for the header bell; asks again every minute while signed in. */
export const useUnreadNotifications = (enabled: boolean) =>
    useQuery({
        queryKey: notificationKeys.unread(),
        queryFn: ({ signal }) => notificationApi.unreadCount(signal),
        enabled,
        refetchInterval: UNREAD_POLL_MS,
        select: (data) => data.count,
    });

/** Marks everything as read; the bell drops to zero right away. */
export const useMarkAllRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => notificationApi.markRead(),
        onSuccess: (data) => queryClient.setQueryData(notificationKeys.unread(), data),
    });
};
