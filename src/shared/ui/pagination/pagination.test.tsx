import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/shared/config/tests";
import { pageItems } from "./page-items";
import { Pagination } from "./pagination";

describe("pageItems", () => {
    it("keeps the first, the last and the neighbours, gaps for the rest", () => {
        expect(pageItems(7, 524)).toEqual([1, "gap", 6, 7, 8, "gap", 524]);
        expect(pageItems(1, 524)).toEqual([1, 2, "gap", 524]);
        expect(pageItems(524, 524)).toEqual([1, "gap", 523, 524]);
        // A gap of one page shows that page instead of "…".
        expect(pageItems(4, 10)).toEqual([1, 2, 3, 4, 5, "gap", 10]);
        expect(pageItems(2, 3)).toEqual([1, 2, 3]);
    });
});

describe("Pagination", () => {
    it("jumps to a page by its number and marks the current one", async () => {
        const onChange = vi.fn();
        renderWithProviders(<Pagination page={7} totalPages={524} onChange={onChange} />);

        expect(screen.getByRole("button", { name: "Страница 7" })).toHaveAttribute(
            "aria-current",
            "page",
        );
        expect(screen.getByText("Страница 7 из 524")).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: "Страница 524" }));
        expect(onChange).toHaveBeenCalledWith(524);
        await userEvent.click(screen.getByRole("button", { name: "Назад" }));
        expect(onChange).toHaveBeenLastCalledWith(6);
    });

    it("is hidden when everything fits on one page", () => {
        renderWithProviders(<Pagination page={1} totalPages={1} onChange={vi.fn()} />);
        expect(screen.queryByRole("navigation")).toBeNull();
    });
});
