import { screen } from "@testing-library/react";
import { ROUTES } from "@/shared/config/routes";
import { renderWithProviders } from "@/shared/config/tests";
import { Layout } from "./layout";

// Pages are lazy chunks, so they are awaited with findBy*.
describe("App routing", () => {
    it("shows a loader, then the landing page at /", async () => {
        renderWithProviders(<Layout />, ROUTES.home);
        expect(screen.getByRole("status", { name: "Загрузка" })).toBeInTheDocument();
        expect(await screen.findByRole("heading", { name: /Universal Saver/ })).toBeInTheDocument();
        expect(screen.queryByRole("status", { name: "Загрузка" })).toBeNull();
    });

    it("links the Start button to the library page", async () => {
        renderWithProviders(<Layout />, ROUTES.home);
        const startLink = await screen.findByRole("link", { name: "Начать" });
        expect(startLink).toHaveAttribute("href", ROUTES.library);
        // A link must not wrap a <button>: nested interactive elements are invalid HTML.
        expect(startLink.querySelector("button")).toBeNull();
    });

    it("shows the library page with all categories", async () => {
        renderWithProviders(<Layout />, ROUTES.library);
        expect(await screen.findAllByRole("button", { name: "Сохранить" })).toHaveLength(5);
    });

    it.each([ROUTES.discover, "/some/unknown/path"])("shows the 404 page at %s", async (path) => {
        renderWithProviders(<Layout />, path);
        expect(
            await screen.findByRole("heading", { name: "Страница не найдена" }),
        ).toBeInTheDocument();
    });

    it("renders the header on every page, even while a page is loading", () => {
        renderWithProviders(<Layout />, "/some/unknown/path");
        expect(screen.getByRole("navigation")).toBeInTheDocument();
    });
});
