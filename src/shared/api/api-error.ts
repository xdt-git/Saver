import { API_ERROR_CODES, type ApiErrorCode } from "./types";

const STATUS_TO_CODE: Record<number, ApiErrorCode> = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    422: "VALIDATION_ERROR",
    429: "TOO_MANY_REQUESTS",
};

const isKnownCode = (code: unknown): code is ApiErrorCode =>
    API_ERROR_CODES.includes(code as ApiErrorCode);

/** Error thrown by the API client for any failed request. */
export class ApiError extends Error {
    readonly status: number;
    readonly code: ApiErrorCode;
    readonly fields?: Record<string, string>;

    constructor(params: {
        status: number;
        code: ApiErrorCode;
        message?: string;
        fields?: Record<string, string>;
    }) {
        super(params.message ?? params.code);
        this.name = "ApiError";
        this.status = params.status;
        this.code = params.code;
        this.fields = params.fields;
    }

    /** Uses the server's code when it is known, otherwise derives one from the HTTP status. */
    static codeFor(status: number, serverCode?: unknown): ApiErrorCode {
        if (isKnownCode(serverCode)) return serverCode;
        if (STATUS_TO_CODE[status]) return STATUS_TO_CODE[status];
        return status >= 500 ? "INTERNAL_ERROR" : "UNKNOWN";
    }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;
