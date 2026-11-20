import { render, screen } from "@testing-library/react";
import { Text } from "./text";

describe("Text", () => {
    it("renders a span without glow by default", () => {
        render(<Text>Plain</Text>);
        const el = screen.getByText("Plain");
        expect(el.tagName).toBe("SPAN");
        expect(el).not.toHaveClass("glow");
    });

    it("renders the requested tag with the glow style", () => {
        render(
            <Text as="h1" glow className="title">
                Title
            </Text>,
        );
        const heading = screen.getByRole("heading", { level: 1, name: "Title" });
        expect(heading).toHaveClass("glow", "title");
    });
});
