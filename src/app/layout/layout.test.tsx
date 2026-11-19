import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/shared/config/tests";
import { Layout } from "./layout";

describe("App routing", () => {
    it("shows the landing page at /", () => {
        renderWithProviders(<Layout />, "/");
        expect(screen.getByRole("heading", { name: /Universal Saver/ })).toBeInTheDocument();
    });

    it("links the Start button to the library page", () => {
        renderWithProviders(<Layout />, "/");
        const startLink = screen.getByRole("link", { name: "Начать" });
        expect(startLink).toHaveAttribute("href", "/Save");
        // A link must not wrap a <button>: nested interactive elements are invalid HTML.
        expect(startLink.querySelector("button")).toBeNull();
    });

    it("shows the library page with all categories at /Save", () => {
        renderWithProviders(<Layout />, "/Save");
        expect(screen.getAllByRole("button", { name: "Сохранить" })).toHaveLength(5);
    });

    it.each(["/discover", "/some/unknown/path"])("shows the 404 page at %s", (path) => {
        renderWithProviders(<Layout />, path);
        expect(screen.getByRole("heading", { name: "Страница не найдена" })).toBeInTheDocument();
    });

    it("renders the header on every page", () => {
        renderWithProviders(<Layout />, "/some/unknown/path");
        expect(screen.getByRole("navigation")).toBeInTheDocument();
    });
});
