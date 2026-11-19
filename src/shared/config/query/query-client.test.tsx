import { useQuery } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import { ApiError, apiClient, createQueryKeys, getErrorMessage } from "@/shared/api";
import { renderWithProviders } from "@/shared/config/tests";
import {
    MAX_QUERY_RETRIES,
    QUERY_STALE_TIME_MS,
    createQueryClient,
    shouldRetryQuery,
} from "./query-client";

const apiError = (status: number, code: ConstructorParameters<typeof ApiError>[0]["code"]) =>
    new ApiError({ status, code });

describe("shouldRetryQuery", () => {
    it("retries network failures and server errors", () => {
        expect(shouldRetryQuery(0, apiError(0, "NETWORK_ERROR"))).toBe(true);
        expect(shouldRetryQuery(1, apiError(503, "INTERNAL_ERROR"))).toBe(true);
    });

    it("does not retry client errors or unknown errors", () => {
        for (const [status, code] of [
            [400, "BAD_REQUEST"],
            [401, "UNAUTHORIZED"],
            [403, "FORBIDDEN"],
            [404, "NOT_FOUND"],
            [409, "CONFLICT"],
            [422, "VALIDATION_ERROR"],
        ] as const) {
            expect(shouldRetryQuery(0, apiError(status, code)), code).toBe(false);
        }
        expect(shouldRetryQuery(0, new Error("boom"))).toBe(false);
    });

    it("stops after the retry limit", () => {
        expect(shouldRetryQuery(MAX_QUERY_RETRIES, apiError(0, "NETWORK_ERROR"))).toBe(false);
    });
});

describe("createQueryClient", () => {
    it("uses the app defaults", () => {
        const { queries, mutations } = createQueryClient().getDefaultOptions();
        expect(queries?.staleTime).toBe(QUERY_STALE_TIME_MS);
        expect(queries?.refetchOnWindowFocus).toBe(false);
        expect(queries?.retry).toBe(shouldRetryQuery);
        expect(mutations?.retry).toBe(false);
    });
});

describe("createQueryKeys", () => {
    it("builds hierarchical keys for a resource", () => {
        const keys = createQueryKeys("content");
        expect(keys.all).toEqual(["content"]);
        expect(keys.lists()).toEqual(["content", "list"]);
        expect(keys.list({ genre: "drama" })).toEqual(["content", "list", { genre: "drama" }]);
        expect(keys.detail(42)).toEqual(["content", "detail", 42]);
    });
});

describe("queries through the API client", () => {
    const contentKeys = createQueryKeys("content");

    const ContentTitle = () => {
        const query = useQuery({
            queryKey: contentKeys.detail(1),
            queryFn: () => apiClient.get<{ title: string }>("/content/1"),
        });
        if (query.isPending) return <p>loading</p>;
        if (query.isError) return <p role="alert">{getErrorMessage(query.error)}</p>;
        return <h1>{query.data.title}</h1>;
    };

    afterEach(() => vi.unstubAllGlobals());

    it("renders data loaded through the provider", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => Response.json({ success: true, data: { title: "Dune" } })),
        );
        renderWithProviders(<ContentTitle />);
        expect(screen.getByText("loading")).toBeInTheDocument();
        expect(await screen.findByRole("heading", { name: "Dune" })).toBeInTheDocument();
    });

    it("shows a localized error message when the request fails", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () =>
                Response.json({ success: false, error: { code: "NOT_FOUND" } }, { status: 404 }),
            ),
        );
        renderWithProviders(<ContentTitle />);
        expect(await screen.findByRole("alert")).toHaveTextContent("Ничего не найдено.");
    });
});
