import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/api";
import type { ContentType, LibraryStatus } from "@/shared/config/content";

/** GET /users/:id/statistics — aggregated by the API (no double counting). */
export interface Statistics<C = unknown> {
    library: Record<LibraryStatus, number> & { total: number };
    completed: { total: number; byType: Record<ContentType, number> };
    /** Real durations only; itemsWithoutDuration completed items are not in `minutes`. */
    watchTime: { minutes: number; itemsWithDuration: number; itemsWithoutDuration: number };
    ratings: { average: number | null; count: number };
    favoriteGenres: { slug: string; name: string; count: number }[];
    activity: { last7Days: number; last30Days: number };
    /** 12 months, oldest first, "YYYY-MM" in UTC, zero-filled. */
    monthly: { month: string; completed: number }[];
    /** `C` is the catalog item shape (entities/content). */
    topContent: { value: number; content: C }[];
    social: { followersCount: number; followingCount: number };
}

export const statisticsKeys = {
    all: ["statistics"] as const,
    user: (id: number) => ["statistics", id] as const,
};

export const useStatistics = <C>(userId: number, enabled = true) =>
    useQuery({
        queryKey: statisticsKeys.user(userId),
        queryFn: ({ signal }) =>
            apiClient.get<Statistics<C>>(`/users/${userId}/statistics`, { signal }),
        enabled,
    });
