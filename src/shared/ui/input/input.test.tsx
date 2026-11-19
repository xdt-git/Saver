import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { Input } from "./input";

describe("Input", () => {
    it("links the label to the input", () => {
        render(<Input label="Email" />);
        expect(screen.getByLabelText("Email").tagName).toBe("INPUT");
    });

    it("accepts typing", async () => {
        render(<Input label="Username" />);
        const input = screen.getByLabelText("Username");
        await userEvent.type(input, "saver");
        expect(input).toHaveValue("saver");
    });

    it("shows the hint and describes the input with it", () => {
        render(<Input label="Username" hint="3 to 20 characters" />);
        const input = screen.getByLabelText("Username");
        expect(input).toHaveAccessibleDescription("3 to 20 characters");
        expect(input).not.toHaveAttribute("aria-invalid");
    });

    it("shows the error instead of the hint and marks the input invalid", () => {
        render(<Input label="Password" hint="Hint" error="Too short" />);
        const input = screen.getByLabelText("Password");
        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(input).toHaveAccessibleDescription("Too short");
        expect(screen.getByRole("alert")).toHaveTextContent("Too short");
        expect(screen.queryByText("Hint")).toBeNull();
    });

    it("forwards the ref to the input element", () => {
        const ref = createRef<HTMLInputElement>();
        render(<Input ref={ref} label="Email" />);
        expect(ref.current).toBe(screen.getByLabelText("Email"));
    });
});
