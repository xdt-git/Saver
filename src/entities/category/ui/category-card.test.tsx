import { render, screen } from "@testing-library/react";
import { CategoryCard } from "./category-card";

describe("CategoryCard", () => {
    it("shows the image, description and save button", () => {
        render(<CategoryCard imgBlue="/film.webp" altBlue="Film" description="Save your films" />);

        expect(screen.getByAltText("Film")).toHaveAttribute("src", "/film.webp");
        expect(screen.getByText("Save your films")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Сохранить" })).toBeInTheDocument();
    });
});
