import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { makePage } from "@/entities/content";
import { sessionTestOptions, TEST_USER } from "@/entities/session";
import { mockApi, renderWithProviders } from "@/shared/config/tests";
import { Layout } from "./layout";

afterEach(() => vi.unstubAllGlobals());

describe("My library page", () => {
    it("is for signed-in users only", async () => {
        renderWithProviders(<Layout />, "/collection", sessionTestOptions(null));
        expect(await screen.findByRole("heading", { name: "Вход" })).toBeInTheDocument();
    });

    it("reads the status tab and category from the URL", async () => {
        const api = mockApi({
            "GET /api/library": () => ({ body: makePage([]) }),
            "GET /api/genres": () => ({ body: [] }),
        });
        renderWithProviders(
            <Layout />,
            "/collection?status=planned&type=anime",
            sessionTestOptions(TEST_USER),
        );

        expect(await screen.findByRole("heading", { name: "Моя библиотека" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "В планах" })).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        await vi.waitFor(() => expect(api.calls("GET /api/library")).toHaveLength(1));
        const query = api.calls("GET /api/library")[0]?.url.searchParams;
        expect(query?.get("status")).toBe("planned");
        expect(query?.get("type")).toBe("anime");

        await userEvent.click(screen.getByRole("button", { name: "Смотрю" }));
        await vi.waitFor(() =>
            expect(api.calls("GET /api/library").at(-1)?.url.searchParams.get("status")).toBe(
                "watching",
            ),
        );
    });

    it("is the main nav's library link, also from the old /Save address", async () => {
        mockApi({});
        renderWithProviders(<Layout />, "/Save", sessionTestOptions(TEST_USER));
        expect(await screen.findByRole("heading", { name: "Моя библиотека" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Моя библиотека" })).toHaveAttribute(
            "href",
            "/collection",
        );

        await userEvent.click(screen.getByRole("button", { name: "Меню профиля neo" }));
        expect(screen.queryByRole("menuitem", { name: "Моя библиотека" })).toBeNull();
    });
});
