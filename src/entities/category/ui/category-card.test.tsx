import { render, screen } from "@testing-library/react";
import { CategoryCard } from "./category-card";

describe("CategoryCard", () => {
    it("shows the translated image alt, description and save button", () => {
        render(
            <CategoryCard category={{ id: "film", imgBlue: "/film.webp", imgPink: "/p.webp" }} />,
        );

        expect(screen.getByAltText("Фильмы")).toHaveAttribute("src", "/film.webp");
        expect(screen.getByText(/Сохрани любимые фильмы/)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Сохранить" })).toBeInTheDocument();
    });
});
