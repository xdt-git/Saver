/** Error codes the API returns in error.code, plus client-side ones. */
export const API_ERROR_CODES = [
    "BAD_REQUEST",
    "UNAUTHORIZED",
    "FORBIDDEN",
    "NOT_FOUND",
    "CONFLICT",
    "VALIDATION_ERROR",
    "TOO_MANY_REQUESTS",
    "INTERNAL_ERROR",
    "SERVICE_UNAVAILABLE",
    // Client side: the request never reached the server or the answer was unreadable.
    "NETWORK_ERROR",
    "UNKNOWN",
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

/** Successful response: { success: true, message, data }. */
export interface ApiSuccess<T> {
    success: true;
    message?: string;
    data: T;
}

/** Failed response: { success: false, message, error: { code, fields? } }. */
export interface ApiFailure {
    success: false;
    message?: string;
    error: {
        code: string;
        /** Field-level validation messages, e.g. { email: "Already taken" }. */
        fields?: Record<string, string>;
    };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | QueryValue[]>;

export interface RequestOptions {
    query?: QueryParams;
    body?: unknown;
    signal?: AbortSignal;
    headers?: Record<string, string>;
    /** Do not try to refresh the session on 401 (used by the auth endpoints themselves). */
    skipAuthRefresh?: boolean;
}
