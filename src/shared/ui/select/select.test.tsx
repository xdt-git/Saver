import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select } from "./select";

const options = [
    { value: "drama", label: "Drama" },
    { value: "comedy", label: "Comedy" },
];

describe("Select", () => {
    it("renders the placeholder and all options", () => {
        render(<Select label="Genre" placeholder="Choose" options={options} />);
        const select = screen.getByLabelText("Genre");
        expect(select).toHaveValue("");
        expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
            "Choose",
            "Drama",
            "Comedy",
        ]);
    });

    it("lets the user pick an option", async () => {
        const onChange = vi.fn();
        render(<Select label="Genre" options={options} onChange={onChange} />);
        await userEvent.selectOptions(screen.getByLabelText("Genre"), "comedy");
        expect(screen.getByLabelText("Genre")).toHaveValue("comedy");
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("shows an error and marks the select invalid", () => {
        render(<Select label="Genre" options={options} error="Required" />);
        expect(screen.getByLabelText("Genre")).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByRole("alert")).toHaveTextContent("Required");
    });
});
