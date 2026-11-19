import { render, screen } from "@testing-library/react";
import { CategoryItems } from "./category-items";

describe("CategoryItems", () => {
    it("renders one card per category", () => {
        render(<CategoryItems />);
        expect(screen.getAllByRole("img")).toHaveLength(5);
    });

    it("uses a different image for every category", () => {
        render(<CategoryItems />);
        const sources = screen.getAllByRole("img").map((img) => img.getAttribute("src"));
        expect(new Set(sources).size).toBe(sources.length);
    });
});
