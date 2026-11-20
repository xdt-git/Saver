import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { makeContent, makePage } from "@/entities/content";
import { sessionTestOptions } from "@/entities/session";
import { apiFailure, mockApi, renderWithProviders } from "@/shared/config/tests";
import { Layout } from "./layout";

afterEach(() => vi.unstubAllGlobals());

const asGuest = sessionTestOptions(null);
const DUNE = makeContent({ description: "Spice must flow.\nArrakis." });

describe("Discover page", () => {
    it("reads filters from the URL and keeps changes in it", async () => {
        const api = mockApi({
            "GET /api/content": () => ({ body: makePage([DUNE]) }),
            "GET /api/genres": () => ({ body: [] }),
        });
        renderWithProviders(<Layout />, "/discover?type=film&sort=title", asGuest);

        expect(await screen.findByRole("article", { name: "Dune" })).toBeInTheDocument();
        const first = api.calls("GET /api/content")[0]?.url.searchParams;
        expect(first?.get("type")).toBe("film");
        expect(first?.get("sort")).toBe("title");
        expect(screen.getByRole("button", { name: "Фильм" })).toHaveAttribute(
            "aria-pressed",
            "true",
        );

        await userEvent.click(screen.getByRole("button", { name: "Аниме" }));
        await vi.waitFor(() =>
            expect(api.calls("GET /api/content").at(-1)?.url.searchParams.get("type")).toBe(
                "anime",
            ),
        );
    });

    it("sends guests who pick a status to the login page", async () => {
        mockApi({
            "GET /api/content": () => ({ body: makePage([DUNE]) }),
            "GET /api/genres": () => ({ body: [] }),
        });
        renderWithProviders(<Layout />, "/discover", asGuest);

        const group = await screen.findByRole("group", { name: "Статус «Dune»" });
        await userEvent.click(within(group).getByRole("button", { name: "В планах" }));
        expect(await screen.findByRole("heading", { name: "Вход" })).toBeInTheDocument();
    });
});

describe("Content details page", () => {
    it("shows everything about the item with actions", async () => {
        mockApi({ "GET /api/content/:id": () => ({ body: DUNE }) });
        renderWithProviders(<Layout />, "/content/1", asGuest);

        expect(await screen.findByRole("heading", { name: "Dune" })).toBeInTheDocument();
        expect(screen.getByText("Фильм · 2021 · 155 мин")).toBeInTheDocument();
        expect(screen.getByText("Жанры: Фантастика")).toBeInTheDocument();
        expect(screen.getByText(/Arrakis/)).toBeInTheDocument();
        expect(screen.getByRole("group", { name: "Статус «Dune»" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Назад к каталогу" })).toHaveAttribute(
            "href",
            "/discover",
        );
    });

    it.each([
        ["an unknown id", "/content/999"],
        ["a broken id", "/content/abc"],
    ])("says the item does not exist for %s", async (_case, path) => {
        mockApi({
            "GET /api/content/:id": ({ params }) =>
                params.id === "abc"
                    ? apiFailure(422, "VALIDATION_ERROR")
                    : apiFailure(404, "NOT_FOUND"),
        });
        renderWithProviders(<Layout />, path, asGuest);
        expect(await screen.findByText("Такого контента нет")).toBeInTheDocument();
    });
});
