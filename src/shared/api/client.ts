import { ApiError } from "./api-error";
import {
    API_URL,
    CSRF_COOKIE_NAME,
    CSRF_HEADER_NAME,
    MUTATING_METHODS,
    REFRESH_PATH,
} from "./config";
import { buildQuery } from "./query";
import type { ApiResponse, RequestOptions } from "./types";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

let sessionExpiredHandler: (() => void) | null = null;

/** Called when the session cannot be refreshed (the AuthProvider logs the user out). */
export const setSessionExpiredHandler = (handler: (() => void) | null) => {
    sessionExpiredHandler = handler;
};

const readCookie = (name: string): string | undefined =>
    document.cookie
        .split("; ")
        .find((part) => part.startsWith(`${name}=`))
        ?.slice(name.length + 1);

const isMutating = (method: Method) => (MUTATING_METHODS as readonly string[]).includes(method);

const parseBody = async (response: Response): Promise<unknown> => {
    if (response.status === 204) return undefined;
    const text = await response.text();
    if (!text) return undefined;
    try {
        return JSON.parse(text) as unknown;
    } catch {
        return undefined;
    }
};

const isFailure = (body: unknown): body is Extract<ApiResponse<unknown>, { success: false }> =>
    typeof body === "object" && body !== null && (body as { success?: unknown }).success === false;

const send = async <T>(method: Method, path: string, options: RequestOptions): Promise<T> => {
    const headers: Record<string, string> = { Accept: "application/json", ...options.headers };
    const hasBody = options.body !== undefined;
    // Files go as multipart: the browser sets the Content-Type with its boundary.
    const isForm = options.body instanceof FormData;
    if (hasBody && !isForm) headers["Content-Type"] = "application/json";
    if (isMutating(method)) {
        const csrf = readCookie(CSRF_COOKIE_NAME);
        if (csrf) headers[CSRF_HEADER_NAME] = decodeURIComponent(csrf);
    }

    let response: Response;
    try {
        response = await fetch(`${API_URL}${path}${buildQuery(options.query)}`, {
            method,
            headers,
            body: isForm
                ? (options.body as FormData)
                : hasBody
                  ? JSON.stringify(options.body)
                  : undefined,
            credentials: "include",
            signal: options.signal,
        });
    } catch (cause) {
        if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
        throw new ApiError({ status: 0, code: "NETWORK_ERROR" });
    }

    const body = await parseBody(response);

    if (!response.ok || isFailure(body)) {
        const failure = isFailure(body) ? body : undefined;
        throw new ApiError({
            status: response.status,
            code: ApiError.codeFor(response.status, failure?.error.code),
            message: failure?.message,
            fields: failure?.error.fields,
        });
    }

    // Unwrap { success: true, data } and return data only.
    if (typeof body === "object" && body !== null && "data" in body) {
        return (body as { data: T }).data;
    }
    return body as T;
};

// One refresh at a time: parallel 401s wait for the same promise.
let refreshPromise: Promise<boolean> | null = null;

const refreshSession = (): Promise<boolean> => {
    refreshPromise ??= send<unknown>("POST", REFRESH_PATH, { skipAuthRefresh: true })
        .then(() => true)
        .catch(() => false)
        .finally(() => {
            refreshPromise = null;
        });
    return refreshPromise;
};

const request = async <T>(
    method: Method,
    path: string,
    options: RequestOptions = {},
): Promise<T> => {
    try {
        return await send<T>(method, path, options);
    } catch (error) {
        const canRefresh =
            error instanceof ApiError &&
            error.status === 401 &&
            !options.skipAuthRefresh &&
            path !== REFRESH_PATH;
        if (!canRefresh) throw error;

        const refreshed = await refreshSession();
        if (!refreshed) {
            sessionExpiredHandler?.();
            throw error;
        }
        // Retry once with the new access token cookie; no further refresh attempts.
        return send<T>(method, path, { ...options, skipAuthRefresh: true });
    }
};

/** REST client: cookies included, JSON in and out, unwraps `data`, throws ApiError. */
export const apiClient = {
    get: <T>(path: string, options?: Omit<RequestOptions, "body">) =>
        request<T>("GET", path, options),
    post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
        request<T>("POST", path, { ...options, body }),
    put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
        request<T>("PUT", path, { ...options, body }),
    patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
        request<T>("PATCH", path, { ...options, body }),
    delete: <T = void>(path: string, options?: RequestOptions) =>
        request<T>("DELETE", path, options),
};
