import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { ExpandablePicker } from "./expandable-picker";

const options = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Beta" },
] as const;

const Harness = ({ onChange = () => {} }: { onChange?: (value: "a" | "b") => void }) => {
    const [value, setValue] = useState<"a" | "b">("a");
    return (
        <>
            <ExpandablePicker<"a" | "b">
                icon={<span>icon</span>}
                label="Pick"
                options={options}
                value={value}
                onChange={(next) => {
                    setValue(next);
                    onChange(next);
                }}
            />
            <p>outside</p>
        </>
    );
};

describe("ExpandablePicker", () => {
    it("shows only the round icon button while collapsed", () => {
        render(<Harness />);
        expect(screen.getByRole("button", { name: "Pick" })).toHaveAttribute(
            "aria-expanded",
            "false",
        );
        expect(screen.queryByRole("group")).toBeNull();
    });

    it("replaces the icon with the options and focuses the selected one", async () => {
        render(<Harness />);
        await userEvent.click(screen.getByRole("button", { name: "Pick" }));

        expect(screen.queryByText("icon")).toBeNull();
        expect(screen.getByRole("group", { name: "Pick" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Alpha" })).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        expect(screen.getByRole("button", { name: "Alpha" })).toHaveFocus();
    });

    it("focuses the selected option even when it is not the first", async () => {
        render(
            <ExpandablePicker<"a" | "b">
                icon={<span>icon</span>}
                label="Pick"
                options={options}
                value="b"
                onChange={() => {}}
            />,
        );
        await userEvent.click(screen.getByRole("button", { name: "Pick" }));
        expect(screen.getByRole("button", { name: "Beta" })).toHaveFocus();
    });

    it("applies the choice and collapses back to the icon", async () => {
        const onChange = vi.fn();
        render(<Harness onChange={onChange} />);
        await userEvent.click(screen.getByRole("button", { name: "Pick" }));
        await userEvent.click(screen.getByRole("button", { name: "Beta" }));

        expect(onChange).toHaveBeenCalledWith("b");
        expect(screen.getByText("icon")).toBeInTheDocument();
        expect(screen.queryByRole("group")).toBeNull();
    });

    it("collapses on Escape and on a click outside", async () => {
        render(<Harness />);
        await userEvent.click(screen.getByRole("button", { name: "Pick" }));
        await userEvent.keyboard("{Escape}");
        expect(screen.queryByRole("group")).toBeNull();

        await userEvent.click(screen.getByRole("button", { name: "Pick" }));
        await userEvent.click(screen.getByText("outside"));
        expect(screen.queryByRole("group")).toBeNull();
    });
});
