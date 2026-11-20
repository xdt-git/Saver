import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { ChipGroup } from "./chip-group";

// Shared visual pieces that the bigger tests use only in one state.
describe("ChipGroup", () => {
    const Demo = ({ max }: { max?: number }) => {
        const [value, setValue] = useState<string[]>([]);
        return (
            <ChipGroup
                label="Жанры"
                options={["a", "b", "c"].map((v) => ({ value: v, label: v.toUpperCase() }))}
                value={value}
                onChange={setValue}
                max={max}
                error={value.length === 0 ? "Pick one" : undefined}
            />
        );
    };

    it("toggles chips on and off and reports errors", async () => {
        render(<Demo />);
        expect(screen.getByRole("alert")).toHaveTextContent("Pick one");
        await userEvent.click(screen.getByRole("button", { name: "A" }));
        expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("aria-pressed", "true");
        await userEvent.click(screen.getByRole("button", { name: "A" }));
        expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("aria-pressed", "false");
    });

    it("disables the rest once the limit is reached, but keeps selected ones removable", async () => {
        render(<Demo max={2} />);
        await userEvent.click(screen.getByRole("button", { name: "A" }));
        await userEvent.click(screen.getByRole("button", { name: "B" }));
        expect(screen.getByRole("button", { name: "C" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "A" })).toBeEnabled();
        await userEvent.click(screen.getByRole("button", { name: "A" }));
        expect(screen.getByRole("button", { name: "C" })).toBeEnabled();
    });
});
