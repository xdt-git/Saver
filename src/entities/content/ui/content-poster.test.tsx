import { render } from "@testing-library/react";
import { ContentPoster } from "./content-poster";

describe("ContentPoster", () => {
    it("lazy-loads the poster with the title as its description", () => {
        const { container } = render(
            <ContentPoster item={{ title: "Dune", posterUrl: "https://img.example/dune.webp" }} />,
        );
        const img = container.querySelector("img");
        expect(img).toHaveAttribute("alt", "Dune");
        expect(img).toHaveAttribute("loading", "lazy");
    });

    it("shows a decorative placeholder when there is no poster", () => {
        const { container } = render(<ContentPoster item={{ title: "Dune", posterUrl: null }} />);
        expect(container.querySelector("img")).toBeNull();
        expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    });
});
