import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/shared/config/tests";
import { CategoryItems } from "./category-items";

describe("CategoryItems", () => {
    it("renders one card per category", () => {
        renderWithProviders(<CategoryItems />);
        expect(screen.getAllByRole("img")).toHaveLength(5);
    });

    it("uses a different image for every category", () => {
        renderWithProviders(<CategoryItems />);
        const sources = screen.getAllByRole("img").map((img) => img.getAttribute("src"));
        expect(new Set(sources).size).toBe(sources.length);
    });

    it("alternates the card layout: picture left, then picture right", () => {
        const { container } = renderWithProviders(<CategoryItems />);
        const cards = [...container.querySelectorAll("[data-reversed]")];
        expect(cards.map((card) => card.getAttribute("data-reversed"))).toEqual([
            "false",
            "true",
            "false",
            "true",
            "false",
        ]);
    });
});
