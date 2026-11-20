/** Base URL of the REST API. Falls back to a same-origin /api (e.g. behind a dev proxy). */
export const API_URL = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/+$/, "");

/** Endpoint that issues a new access token from the refresh-token cookie. */
export const REFRESH_PATH = "/auth/refresh";

// CSRF protection for cookie-based auth (double-submit cookie): the API sets a readable
// cookie and expects the same value in a header on every state-changing request.
export const CSRF_COOKIE_NAME = "csrf_token";
export const CSRF_HEADER_NAME = "X-CSRF-Token";

export const MUTATING_METHODS = ["POST", "PUT", "PATCH", "DELETE"] as const;
