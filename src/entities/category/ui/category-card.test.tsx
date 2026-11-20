import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/shared/config/tests";
import { CategoryCard } from "./category-card";

describe("CategoryCard", () => {
    it("shows the translated image alt, description and a save link", () => {
        renderWithProviders(
            <CategoryCard
                category={{ id: "film", imgBlue: "/film.webp", imgPink: "/p.webp" }}
                to="/collection?type=film"
            />,
        );

        expect(screen.getByAltText("Фильмы")).toHaveAttribute("src", "/film.webp");
        expect(screen.getByText(/Сохрани любимые фильмы/)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Сохранить" })).toHaveAttribute(
            "href",
            "/collection?type=film",
        );
    });
});
