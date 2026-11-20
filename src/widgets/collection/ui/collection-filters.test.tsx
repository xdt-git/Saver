import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { sessionTestOptions } from "@/entities/session";
import { mockApi, renderWithProviders } from "@/shared/config/tests";
import { EMPTY_COLLECTION_FILTERS, type CollectionFilters as Filters } from "../model/filters";
import { CollectionFilters } from "./collection-filters";

afterEach(() => vi.unstubAllGlobals());

const renderFilters = (value: Filters = EMPTY_COLLECTION_FILTERS) => {
    mockApi({ "GET /api/genres": () => ({ body: [{ slug: "drama", name: "Drama" }] }) });
    const onChange = vi.fn();
    renderWithProviders(
        <CollectionFilters value={value} onChange={onChange} />,
        "/",
        sessionTestOptions(null),
    );
    return onChange;
};

describe("CollectionFilters", () => {
    it("switches status tabs and goes back to page 1", async () => {
        const onChange = renderFilters({ ...EMPTY_COLLECTION_FILTERS, page: 3 });
        await userEvent.click(screen.getByRole("button", { name: "Смотрю" }));
        expect(onChange).toHaveBeenLastCalledWith({ status: "watching", page: 1 });
        await userEvent.click(screen.getByRole("button", { name: "Всё" }));
        expect(onChange).toHaveBeenLastCalledWith({ status: undefined, page: 1 });
    });

    it("filters by type and genre and sorts", async () => {
        const onChange = renderFilters();
        await userEvent.selectOptions(screen.getByLabelText("Тип"), "anime");
        expect(onChange).toHaveBeenLastCalledWith({ type: "anime", page: 1 });
        await userEvent.selectOptions(screen.getByLabelText("Тип"), "");
        expect(onChange).toHaveBeenLastCalledWith({ type: undefined, page: 1 });

        await screen.findByRole("option", { name: "Драма" });
        await userEvent.selectOptions(screen.getByLabelText("Жанр"), "drama");
        expect(onChange).toHaveBeenLastCalledWith({ genre: "drama", page: 1 });

        await userEvent.selectOptions(screen.getByLabelText("Сортировка"), "title");
        expect(onChange).toHaveBeenLastCalledWith({ sort: "title", page: 1 });
    });

    it("offers a reset only when something narrows the list, keeping the status tab", async () => {
        renderFilters();
        expect(screen.queryByRole("button", { name: "Сбросить фильтры" })).toBeNull();

        vi.unstubAllGlobals();
        const onChange = renderFilters({
            ...EMPTY_COLLECTION_FILTERS,
            status: "planned",
            type: "film",
        });
        await userEvent.click(screen.getByRole("button", { name: "Сбросить фильтры" }));
        expect(onChange).toHaveBeenLastCalledWith({
            search: "",
            type: undefined,
            genre: undefined,
            page: 1,
        });
    });
});
