import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "@/shared/config/tests";
import { Button } from "./button";

describe("Button", () => {
    it("renders a native button with type=button by default", () => {
        render(<Button>Save</Button>);
        const button = screen.getByRole("button", { name: "Save" });
        expect(button).toHaveAttribute("type", "button");
        expect(button).toHaveClass("primary");
    });

    it("applies the chosen variant and extra class names", () => {
        render(
            <Button variant="icon" className="extra">
                Icon
            </Button>,
        );
        const button = screen.getByRole("button", { name: "Icon" });
        expect(button).toHaveClass("icon", "extra");
        expect(button).not.toHaveClass("primary");
    });

    it("renders a router link instead of a button when `to` is passed", () => {
        renderWithRouter(
            <Button to="/library" variant="nav">
                Library
            </Button>,
        );
        expect(screen.getByRole("link", { name: "Library" })).toHaveAttribute("href", "/library");
        expect(screen.queryByRole("button")).toBeNull();
    });

    it("calls onClick and respects disabled", async () => {
        const onClick = vi.fn();
        const { rerender } = render(<Button onClick={onClick}>Go</Button>);
        await userEvent.click(screen.getByRole("button", { name: "Go" }));
        expect(onClick).toHaveBeenCalledTimes(1);

        rerender(
            <Button onClick={onClick} disabled>
                Go
            </Button>,
        );
        await userEvent.click(screen.getByRole("button", { name: "Go" }));
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
