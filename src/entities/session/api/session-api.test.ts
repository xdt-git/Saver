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
    it("returns the signed-in user", async () => {
        fetchMock.mockResolvedValueOnce(json(200, { success: true, data: TEST_USER }));
        await expect(sessionApi.me()).resolves.toEqual(TEST_USER);
    });

    it("renews an expired access token once, then retries", async () => {
        fetchMock
            .mockResolvedValueOnce(unauthorized())
            .mockResolvedValueOnce(json(200, { success: true, data: null }))
            .mockResolvedValueOnce(json(200, { success: true, data: TEST_USER }));

        await expect(sessionApi.me()).resolves.toEqual(TEST_USER);
        expect(urls()).toEqual(["/api/auth/me", "/api/auth/refresh", "/api/auth/me"]);
    });

    it("treats a guest (no session to renew) as null, not as an error", async () => {
        fetchMock.mockResolvedValueOnce(unauthorized()).mockResolvedValueOnce(unauthorized());
        await expect(sessionApi.me()).resolves.toBeNull();
    });

    it("lets other failures surface", async () => {
        fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
        await expect(sessionApi.me()).rejects.toMatchObject({ code: "NETWORK_ERROR" });
    });
});
