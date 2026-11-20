import { fireEvent, render, screen } from "@testing-library/react";
import { Avatar } from "./avatar";

describe("Avatar", () => {
    it("shows the picture when there is one", () => {
        const { container } = render(<Avatar name="Neo" src="https://img.example/neo.webp" />);
        expect(container.querySelector("img")).toHaveAttribute(
            "src",
            "https://img.example/neo.webp",
        );
    });

    it.each([
        ["Neo Anderson", "NA"],
        ["trinity", "T"],
        ["agent_smith", "AS"],
        ["", "?"],
    ])("falls back to initials for %j", (name, initials) => {
        render(<Avatar name={name} src={null} />);
        expect(screen.getByText(initials)).toBeInTheDocument();
    });

    it("switches to initials when the picture fails to load", () => {
        const { container } = render(<Avatar name="Neo" src="https://img.example/broken.webp" />);
        fireEvent.error(container.querySelector("img") as HTMLImageElement);
        expect(container.querySelector("img")).toBeNull();
        expect(screen.getByText("N")).toBeInTheDocument();
    });
});
