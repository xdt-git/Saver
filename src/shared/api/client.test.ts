import { i18n } from "@/shared/config/i18n";
import { ApiError } from "./api-error";
import { apiClient, setSessionExpiredHandler } from "./client";
import { getErrorMessage } from "./error-message";
import { buildQuery } from "./query";
import { API_ERROR_CODES } from "./types";

const json = (status: number, body?: unknown) =>
    new Response(body === undefined ? null : JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });

const fetchMock = vi.fn<typeof fetch>();
const calledUrls = () => fetchMock.mock.calls.map(([url]) => String(url));
const callInit = (index: number) => fetchMock.mock.calls[index]?.[1] as RequestInit;

beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    setSessionExpiredHandler(null);
    document.cookie = "csrf_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("apiClient: requests and responses", () => {
    it("unwraps data, sends cookies and builds the query string", async () => {
        fetchMock.mockResolvedValueOnce(json(200, { success: true, data: [{ id: 1 }] }));

        const data = await apiClient.get<{ id: number }[]>("/content", {
            query: { search: "dune", genre: ["drama", "sci-fi"], year: undefined },
        });

        expect(data).toEqual([{ id: 1 }]);
        expect(calledUrls()).toEqual(["/api/content?search=dune&genre=drama&genre=sci-fi"]);
        expect(callInit(0).credentials).toBe("include");
        expect(callInit(0).method).toBe("GET");
    });

    it("sends a JSON body and the CSRF header on mutating requests only", async () => {
        document.cookie = "csrf_token=abc123";
        fetchMock
            .mockResolvedValueOnce(json(201, { success: true, data: { id: 7 } }))
            .mockResolvedValueOnce(json(200, { success: true, data: [] }));

        await apiClient.post("/library", { contentId: 3, status: "planned" });
        await apiClient.get("/library");

        const postHeaders = callInit(0).headers as Record<string, string>;
        expect(callInit(0).body).toBe(JSON.stringify({ contentId: 3, status: "planned" }));
        expect(postHeaders["Content-Type"]).toBe("application/json");
        expect(postHeaders["X-CSRF-Token"]).toBe("abc123");
        expect((callInit(1).headers as Record<string, string>)["X-CSRF-Token"]).toBeUndefined();
    });

    it("returns undefined for 204 No Content", async () => {
        fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
        await expect(apiClient.delete("/library/1")).resolves.toBeUndefined();
    });
});

describe("apiClient: errors", () => {
    it("throws ApiError with the server code, message and field errors", async () => {
        fetchMock.mockResolvedValueOnce(
            json(409, {
                success: false,
                message: "Email is taken",
                error: { code: "CONFLICT", fields: { email: "Email is taken" } },
            }),
        );

        const error = await apiClient.post("/auth/register", {}).catch((e: unknown) => e);

        expect(error).toBeInstanceOf(ApiError);
        expect(error).toMatchObject({
            status: 409,
            code: "CONFLICT",
            message: "Email is taken",
            fields: { email: "Email is taken" },
        });
    });

    it("derives the code from the status when the body is missing or unknown", async () => {
        fetchMock
            .mockResolvedValueOnce(new Response("<html>oops</html>", { status: 500 }))
            .mockResolvedValueOnce(json(404, { success: false, error: { code: "WEIRD" } }));

        await expect(apiClient.get("/a")).rejects.toMatchObject({ code: "INTERNAL_ERROR" });
        await expect(apiClient.get("/b")).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

    it("reports a network failure as NETWORK_ERROR", async () => {
        fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
        await expect(apiClient.get("/content")).rejects.toMatchObject({
            status: 0,
            code: "NETWORK_ERROR",
        });
    });
});

describe("apiClient: session refresh", () => {
    it("refreshes the session on 401 and retries the request once", async () => {
        fetchMock
            .mockResolvedValueOnce(json(401, { success: false, error: { code: "UNAUTHORIZED" } }))
            .mockResolvedValueOnce(json(200, { success: true, data: null }))
            .mockResolvedValueOnce(json(200, { success: true, data: { id: 1 } }));

        await expect(apiClient.get("/auth/me")).resolves.toEqual({ id: 1 });
        expect(calledUrls()).toEqual(["/api/auth/me", "/api/auth/refresh", "/api/auth/me"]);
    });

    it("runs a single refresh for parallel 401 responses", async () => {
        fetchMock.mockImplementation(async (input) => {
            const url = String(input);
            if (url.endsWith("/auth/refresh")) return json(200, { success: true, data: null });
            const retried = fetchMock.mock.calls.some(([u]) => String(u).endsWith("/auth/refresh"));
            return retried
                ? json(200, { success: true, data: url })
                : json(401, { success: false, error: { code: "UNAUTHORIZED" } });
        });

        await Promise.all([apiClient.get("/a"), apiClient.get("/b"), apiClient.get("/c")]);

        expect(calledUrls().filter((url) => url.endsWith("/auth/refresh"))).toHaveLength(1);
    });

    it("calls the session-expired handler when the refresh fails", async () => {
        const onExpired = vi.fn();
        setSessionExpiredHandler(onExpired);
        fetchMock
            .mockResolvedValueOnce(json(401, { success: false, error: { code: "UNAUTHORIZED" } }))
            .mockResolvedValueOnce(json(401, { success: false, error: { code: "UNAUTHORIZED" } }));

        await expect(apiClient.get("/library")).rejects.toMatchObject({ code: "UNAUTHORIZED" });
        expect(onExpired).toHaveBeenCalledTimes(1);
        expect(calledUrls()).toEqual(["/api/library", "/api/auth/refresh"]);
    });

    it("does not refresh when skipAuthRefresh is set", async () => {
        fetchMock.mockResolvedValueOnce(
            json(401, { success: false, error: { code: "UNAUTHORIZED" } }),
        );
        await expect(
            apiClient.post("/auth/login", {}, { skipAuthRefresh: true }),
        ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
        expect(calledUrls()).toEqual(["/api/auth/login"]);
    });
});

describe("buildQuery", () => {
    it("skips empty values and repeats array keys", () => {
        expect(buildQuery({ a: 1, b: "", c: null, d: undefined, e: [true, false] })).toBe(
            "?a=1&e=true&e=false",
        );
        expect(buildQuery({})).toBe("");
        expect(buildQuery()).toBe("");
    });
});

describe("getErrorMessage", () => {
    it("translates every error code in both languages", async () => {
        for (const language of ["ru", "en"]) {
            await i18n.changeLanguage(language);
            for (const code of API_ERROR_CODES) {
                const text = getErrorMessage(new ApiError({ status: 400, code }));
                expect(text, `${language}: ${code}`).not.toBe(`errors.${code}`);
                expect(text.length).toBeGreaterThan(0);
            }
        }
    });

    it("uses the current language and a generic text for unknown errors", async () => {
        const networkError = new ApiError({ status: 0, code: "NETWORK_ERROR" });
        expect(getErrorMessage(networkError)).toBe("Нет связи с сервером. Проверьте интернет.");
        await i18n.changeLanguage("en");
        expect(getErrorMessage(networkError)).toBe(
            "Cannot reach the server. Check your connection.",
        );
        expect(getErrorMessage(new Error("boom"))).toBe("Something went wrong.");
    });
});
