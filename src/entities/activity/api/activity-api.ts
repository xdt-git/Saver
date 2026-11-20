import { useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/api";
import type { ContentType, LibraryStatus } from "@/shared/config/content";
import type { ActivitySocial } from "./social-api";

export interface ActivityUser {
    id: number;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
}

export type ActivityType = "library_added" | "status_changed" | "rated";

/** One real event: what a user did with which item. */
export interface Activity {
    id: number;
    type: ActivityType;
    /** { status } | { from, to } | { value } depending on the type. */
    payload: {
        status?: LibraryStatus;
        from?: LibraryStatus;
        to?: LibraryStatus;
        value?: number;
    } | null;
    createdAt: string;
    user: ActivityUser;
    content: { id: number; title: string; type: ContentType; posterUrl: string | null } | null;
    /** Likes and comments. */
    social: ActivitySocial;
}

export interface ActivityPage {
    items: Activity[];
    /** Pass as `before` for the next page; null when there is no more. */
    nextCursor: number | null;
}

/** Whose events: one user's, the people the signed-in user follows, or everyone's. */
export type ActivitySource = { kind: "user"; userId: number } | { kind: "feed" } | { kind: "all" };

export const ACTIVITY_PAGE_SIZE = 20;

export const activityKeys = {
    all: ["activity"] as const,
    source: (source: ActivitySource) => ["activity", source] as const,
};

const path = (source: ActivitySource) =>
    source.kind === "feed"
        ? "/feed"
        : source.kind === "all"
          ? "/activity"
          : `/users/${source.userId}/activity`;

export const activityApi = {
    page: (source: ActivitySource, before?: number, signal?: AbortSignal) =>
        apiClient.get<ActivityPage>(path(source), {
            query: { before, limit: ACTIVITY_PAGE_SIZE },
            signal,
        }),
};

/** Newest first; "show more" loads older events by cursor. */
export const useActivity = (source: ActivitySource, enabled = true) =>
    useInfiniteQuery({
        queryKey: activityKeys.source(source),
        queryFn: ({ pageParam, signal }) => activityApi.page(source, pageParam, signal),
        initialPageParam: undefined as number | undefined,
        getNextPageParam: (last) => last.nextCursor ?? undefined,
        enabled,
    });
