import { screen } from "@testing-library/react";
import { renderWithRouter } from "@/shared/config/tests";
import { Layout } from "./layout";

describe("App routing", () => {
    it("shows the landing page at /", () => {
        renderWithRouter(<Layout />, "/");
        expect(screen.getByRole("heading", { name: /Universal Saver/ })).toBeInTheDocument();
    });

    it("links the Start button to the library page", () => {
        renderWithRouter(<Layout />, "/");
        const startButton = screen.getByRole("button", { name: "Начать" });
        expect(startButton.closest("a")).toHaveAttribute("href", "/Save");
    });

    it("shows the library page with all categories at /Save", () => {
        renderWithRouter(<Layout />, "/Save");
        expect(screen.getAllByRole("button", { name: "Сохранить" })).toHaveLength(5);
    });

    it.each(["/discover", "/some/unknown/path"])("shows the 404 page at %s", (path) => {
        renderWithRouter(<Layout />, path);
        expect(screen.getByRole("heading", { name: "Not Found Page" })).toBeInTheDocument();
    });

    it("renders the header on every page", () => {
        renderWithRouter(<Layout />, "/some/unknown/path");
        expect(screen.getByRole("navigation")).toBeInTheDocument();
    });
});
