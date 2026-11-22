import { TEST_USER } from "../testing";
import { sessionApi } from "./session-api";

const json = (status: number, body?: unknown) =>
    new Response(body === undefined ? null : JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
const unauthorized = () => json(401, { success: false, error: { code: "UNAUTHORIZED" } });

const fetchMock = vi.fn<typeof fetch>();
const urls = () => fetchMock.mock.calls.map(([url]) => String(url));

beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe("sessionApi.me", () => {
    const session = (user: unknown, canRefresh = false) =>
        json(200, { success: true, data: { user, canRefresh } });

    it("returns the signed-in user", async () => {
        fetchMock.mockResolvedValueOnce(session(TEST_USER));
        await expect(sessionApi.me()).resolves.toEqual(TEST_USER);
    });

    it("renews an expired access token once, then asks again", async () => {
        fetchMock
            .mockResolvedValueOnce(session(null, true))
            .mockResolvedValueOnce(json(200, { success: true, data: null }))
            .mockResolvedValueOnce(session(TEST_USER));

        await expect(sessionApi.me()).resolves.toEqual(TEST_USER);
        expect(urls()).toEqual(["/api/auth/session", "/api/auth/refresh", "/api/auth/session"]);
    });

    it("is a guest with one request and no errors when there is nothing to renew", async () => {
        fetchMock.mockResolvedValueOnce(session(null));
        await expect(sessionApi.me()).resolves.toBeNull();
        expect(urls()).toEqual(["/api/auth/session"]);
    });

    it("is a guest when the refresh cookie turns out stale", async () => {
        fetchMock.mockResolvedValueOnce(session(null, true)).mockResolvedValueOnce(unauthorized());
        await expect(sessionApi.me()).resolves.toBeNull();
    });

    it("lets other failures surface", async () => {
        fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
        await expect(sessionApi.me()).rejects.toMatchObject({ code: "NETWORK_ERROR" });
    });
});
