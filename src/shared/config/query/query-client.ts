import { QueryClient } from "@tanstack/react-query";
import { isApiError } from "@/shared/api";

/** Data stays fresh for 30 s: navigating back and forth does not refetch it. */
export const QUERY_STALE_TIME_MS = 30_000;
/** At most this many retries, and only for transient failures. */
export const MAX_QUERY_RETRIES = 2;

/**
 * Retry only what can succeed on a second try: network failures and server errors (5xx).
 * Client errors (400, 401, 403, 404, 409, 422) would fail the same way again.
 */
export const shouldRetryQuery = (failureCount: number, error: unknown): boolean => {
    if (failureCount >= MAX_QUERY_RETRIES) return false;
    if (!isApiError(error)) return false;
    return error.code === "NETWORK_ERROR" || error.status >= 500;
};

export const createQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: QUERY_STALE_TIME_MS,
                retry: shouldRetryQuery,
                refetchOnWindowFocus: false,
            },
            mutations: {
                // Mutations change data: never repeat them automatically.
                retry: false,
            },
        },
    });
