export interface MockRequest {
    method: string;
    url: URL;
    /** Route parameters, e.g. { id: "7" } for "GET /api/content/:id". */
    params: Record<string, string>;
    body: unknown;
}

export interface MockReply {
    status?: number;
    /** Wrapped into { success: true, data } unless it already has `success`. */
    body?: unknown;
}

type Handler = (request: MockRequest) => MockReply | Promise<MockReply>;

const toMatcher = (pattern: string) => {
    const [method, path = ""] = pattern.split(" ");
    const names: string[] = [];
    const regex = new RegExp(
        `^${path.replace(/:(\w+)/g, (_, name: string) => {
            names.push(name);
            return "([^/]+)";
        })}$`,
    );
    return (request: { method: string; url: URL }) => {
        if (request.method !== method) return null;
        const match = regex.exec(request.url.pathname);
        if (!match) return null;
        return Object.fromEntries(names.map((name, i) => [name, match[i + 1] ?? ""]));
    };
};

const toResponse = ({ status = 200, body }: MockReply) => {
    if (status === 204 || body === undefined) return new Response(null, { status });
    const wrapped =
        typeof body === "object" && body !== null && "success" in body
            ? body
            : { success: true, data: body };
    return new Response(JSON.stringify(wrapped), {
        status,
        headers: { "Content-Type": "application/json" },
    });
};

/** API error body in the server's format. */
export const apiFailure = (status: number, code: string): MockReply => ({
    status,
    body: { success: false, message: code, error: { code } },
});

/**
 * Replaces fetch with a tiny router for tests:
 *   const api = mockApi({ "GET /api/content/:id": ({ params }) => ({ body: item(params.id) }) });
 *   expect(api.calls("GET /api/content")).toHaveLength(1);
 * Unknown routes answer 404. Call vi.unstubAllGlobals() in afterEach.
 */
export const mockApi = (routes: Record<string, Handler>) => {
    const table = Object.entries(routes).map(([pattern, handler]) => ({
        pattern,
        match: toMatcher(pattern),
        handler,
    }));
    const log: { pattern: string; request: MockRequest }[] = [];

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = new URL(String(input), "http://localhost");
        const method = (init?.method ?? "GET").toUpperCase();
        const body =
            typeof init?.body === "string" ? (JSON.parse(init.body) as unknown) : undefined;
        for (const route of table) {
            const params = route.match({ method, url });
            if (!params) continue;
            const request = { method, url, params, body };
            log.push({ pattern: route.pattern, request });
            return toResponse(await route.handler(request));
        }
        return toResponse(apiFailure(404, "NOT_FOUND"));
    });
    vi.stubGlobal("fetch", fetchMock);

    return {
        fetchMock,
        /** Requests that reached a route, in order. */
        calls: (pattern: string) =>
            log.filter((entry) => entry.pattern === pattern).map((entry) => entry.request),
    };
};
