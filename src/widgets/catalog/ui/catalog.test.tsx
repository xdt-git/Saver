import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { makeContent, makePage } from "@/entities/content";
import { sessionTestOptions, TEST_USER } from "@/entities/session";
import { apiFailure, mockApi, renderWithProviders } from "@/shared/config/tests";
import { EMPTY_FILTERS, type CatalogFilters as Filters } from "../model/filters";
import { CatalogFilters } from "./catalog-filters";
import { CatalogResults } from "./catalog-results";
import { RandomPick } from "./random-pick";

const DUNE = makeContent();
const DARK = makeContent({
    id: 2,
    type: "series",
    title: "Dark",
    releaseYear: 2017,
    runtimeMinutes: null,
    episodeCount: 26,
    episodeRuntimeMinutes: 55,
    genres: [{ slug: "mystery", name: "Mystery" }],
    rating: { average: 8.75, count: 4 },
});
const GENRES = [
    { slug: "mystery", name: "Mystery" },
    { slug: "sci-fi", name: "Science Fiction" },
];

afterEach(() => vi.unstubAllGlobals());

const asGuest = sessionTestOptions(null);

describe("CatalogResults", () => {
    it("shows cards with translated type, genres, duration and rating", async () => {
        mockApi({ "GET /api/content": () => ({ body: makePage([DUNE, DARK]) }) });
        renderWithProviders(
            <CatalogResults filters={EMPTY_FILTERS} onPageChange={vi.fn()} />,
            "/",
            asGuest,
        );

        const card = await screen.findByRole("article", { name: "Dark" });
        expect(within(card).getByText("Сериал · 2017 · 26 эп. × 55 мин")).toBeInTheDocument();
        expect(within(card).getByText("Детектив")).toBeInTheDocument();
        expect(within(card).getByRole("img", { name: "Saver: 8.8, оценок: 4" })).toBeVisible();
        expect(within(card).getByRole("link", { name: "Dark" })).toHaveAttribute(
            "href",
            "/content/2",
        );
        expect(screen.getByText("Найдено: 2")).toBeInTheDocument();
    });

    it("sends the filters, sorting and page size to the API", async () => {
        const api = mockApi({ "GET /api/content": () => ({ body: makePage([DUNE]) }) });
        const filters: Filters = {
            ...EMPTY_FILTERS,
            search: " dune ",
            type: "film",
            genre: "sci-fi",
            yearFrom: 2000,
            minRating: 7,
            sort: "rating",
            page: 2,
        };
        renderWithProviders(
            <CatalogResults filters={filters} onPageChange={vi.fn()} />,
            "/",
            asGuest,
        );

        await screen.findByRole("article", { name: "Dune" });
        expect(
            Object.fromEntries(api.calls("GET /api/content")[0]?.url.searchParams ?? []),
        ).toEqual({
            search: "dune",
            type: "film",
            genre: "sci-fi",
            yearFrom: "2000",
            minRating: "7",
            sort: "rating",
            order: "desc",
            page: "2",
            pageSize: "24",
        });
    });

    it("shows skeletons first, then an empty state", async () => {
        mockApi({ "GET /api/content": () => ({ body: makePage([]) }) });
        renderWithProviders(
            <CatalogResults filters={EMPTY_FILTERS} onPageChange={vi.fn()} />,
            "/",
            asGuest,
        );
        expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
        expect(await screen.findByText("Ничего не нашлось")).toBeInTheDocument();
    });

    it("shows an error with retry", async () => {
        const api = mockApi({ "GET /api/content": () => apiFailure(500, "INTERNAL_ERROR") });
        renderWithProviders(
            <CatalogResults filters={EMPTY_FILTERS} onPageChange={vi.fn()} />,
            "/",
            asGuest,
        );

        expect(await screen.findByText("Не удалось загрузить каталог")).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: "Повторить" }));
        await vi.waitFor(() => expect(api.calls("GET /api/content").length).toBeGreaterThan(1));
    });

    it("pages through results", async () => {
        mockApi({ "GET /api/content": () => ({ body: makePage([DUNE], 1, 12, 30) }) });
        const onPageChange = vi.fn();
        renderWithProviders(
            <CatalogResults filters={EMPTY_FILTERS} onPageChange={onPageChange} />,
            "/",
            asGuest,
        );

        expect(await screen.findByText("Страница 1 из 3")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Назад" })).toBeDisabled();
        await userEvent.click(screen.getByRole("button", { name: "Вперёд" }));
        expect(onPageChange).toHaveBeenCalledWith(2);
    });
});

describe("CatalogFilters", () => {
    const renderFilters = (value: Filters = EMPTY_FILTERS) => {
        mockApi({ "GET /api/genres": () => ({ body: GENRES }) });
        const onChange = vi.fn();
        renderWithProviders(<CatalogFilters value={value} onChange={onChange} />, "/", asGuest);
        return onChange;
    };

    it("switches the category and goes back to page 1", async () => {
        const onChange = renderFilters({ ...EMPTY_FILTERS, page: 4 });
        await userEvent.click(screen.getByRole("button", { name: "Сериал" }));
        expect(onChange).toHaveBeenCalledWith({ type: "series", page: 1 });
        await userEvent.click(screen.getByRole("button", { name: "Всё" }));
        expect(onChange).toHaveBeenLastCalledWith({ type: undefined, page: 1 });
    });

    it("searches only after typing stops", async () => {
        const onChange = renderFilters();
        await userEvent.type(screen.getByLabelText("Поиск по названию"), "dune");
        expect(onChange).not.toHaveBeenCalled();
        await vi.waitFor(() => expect(onChange).toHaveBeenCalledWith({ search: "dune", page: 1 }));
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("offers translated genres from the API and combines filters", async () => {
        const onChange = renderFilters();
        const genre = screen.getByLabelText("Жанр");
        await screen.findByRole("option", { name: "Фантастика" });

        await userEvent.selectOptions(genre, "sci-fi");
        expect(onChange).toHaveBeenLastCalledWith({ genre: "sci-fi", page: 1 });
        await userEvent.selectOptions(screen.getByLabelText("Рейтинг от"), "7");
        expect(onChange).toHaveBeenLastCalledWith({ minRating: 7, page: 1 });
        await userEvent.type(screen.getByLabelText("Год от"), "1");
        expect(onChange).toHaveBeenLastCalledWith({ yearFrom: 1, page: 1 });
    });

    it("resets filters but keeps the sorting", async () => {
        const onChange = renderFilters({ ...EMPTY_FILTERS, type: "film", sort: "title" });
        await userEvent.click(screen.getByRole("button", { name: "Сбросить фильтры" }));
        expect(onChange).toHaveBeenCalledWith({ ...EMPTY_FILTERS, sort: "title" });
    });
});

describe("RandomPick", () => {
    it("shows a random item for the filters and fetches another on request", async () => {
        let n = 0;
        const api = mockApi({
            "GET /api/content/random": () => ({ body: [DUNE, DARK][n++ % 2] }),
        });
        renderWithProviders(
            <RandomPick filters={{ ...EMPTY_FILTERS, type: "film" }} />,
            "/",
            asGuest,
        );

        await userEvent.click(screen.getByRole("button", { name: "Случайный выбор" }));
        const dialog = await screen.findByRole("dialog");
        expect(await within(dialog).findByRole("article", { name: "Dune" })).toBeInTheDocument();
        expect(api.calls("GET /api/content/random")[0]?.url.searchParams.get("type")).toBe("film");

        await userEvent.click(within(dialog).getByRole("button", { name: "Другой вариант" }));
        expect(await within(dialog).findByRole("article", { name: "Dark" })).toBeInTheDocument();
    });

    it("says so when nothing matches", async () => {
        mockApi({ "GET /api/content/random": () => apiFailure(404, "NOT_FOUND") });
        renderWithProviders(<RandomPick filters={EMPTY_FILTERS} />, "/", asGuest);
        await userEvent.click(screen.getByRole("button", { name: "Случайный выбор" }));
        expect(await screen.findByText("Под эти фильтры ничего не подходит.")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Другой вариант" })).toBeNull();
    });
});

describe("Card actions", () => {
    /** A tiny stateful server: the list reflects what the mutations changed, like the API. */
    const renderList = () => {
        const item = makeContent({ viewer: { libraryEntryId: null, status: null, rating: null } });
        const viewer = () => item.viewer as NonNullable<typeof item.viewer>;
        const setStatus = (status: string) => {
            item.viewer = { ...viewer(), libraryEntryId: 50, status: status as "planned" };
            return { body: { id: 50, status } };
        };
        const api = mockApi({
            "GET /api/content": () => ({ body: makePage([structuredClone(item)]) }),
            "POST /api/library": ({ body }) => ({
                status: 201,
                ...setStatus((body as { status: string }).status),
            }),
            "PATCH /api/library/:id": ({ body }) => setStatus((body as { status: string }).status),
            "PUT /api/content/:id/rating": ({ body }) => {
                const { value } = body as { value: number };
                item.viewer = { ...viewer(), rating: value };
                item.rating = { average: value, count: 1 };
                return { body: { value, rating: item.rating } };
            },
            "DELETE /api/content/:id/rating": () => {
                item.viewer = { ...viewer(), rating: null };
                item.rating = { average: null, count: 0 };
                return { status: 204 };
            },
        });
        renderWithProviders(
            <CatalogResults filters={EMPTY_FILTERS} onPageChange={vi.fn()} />,
            "/discover",
            sessionTestOptions(TEST_USER),
        );
        return api;
    };

    it("adds to the library the first time, then changes the status in place", async () => {
        const api = renderList();
        const group = await screen.findByRole("group", { name: "Статус «Dune»" });

        await userEvent.click(within(group).getByRole("button", { name: "Смотрю" }));
        expect(api.calls("POST /api/library")[0]?.body).toEqual({
            contentId: 1,
            status: "watching",
        });
        await vi.waitFor(() =>
            expect(within(group).getByRole("button", { name: "Смотрю" })).toHaveAttribute(
                "aria-pressed",
                "true",
            ),
        );

        await userEvent.click(within(group).getByRole("button", { name: "Просмотрено" }));
        await vi.waitFor(() => expect(api.calls("PATCH /api/library/:id")).toHaveLength(1));
        expect(api.calls("PATCH /api/library/:id")[0]?.params.id).toBe("50");
        expect(await screen.findByText("Статус: Просмотрено")).toBeInTheDocument();
    });

    it("rates and removes the rating", async () => {
        const api = renderList();
        const select = await screen.findByLabelText("Оценка «Dune»");

        await userEvent.selectOptions(select, "9");
        expect(api.calls("PUT /api/content/:id/rating")[0]?.body).toEqual({ value: 9 });
        expect(await screen.findByText("Оценка 9 сохранена")).toBeInTheDocument();
        expect(screen.getByRole("img", { name: "Saver: 9.0, оценок: 1" })).toBeVisible();

        await userEvent.selectOptions(select, "");
        await vi.waitFor(() => expect(api.calls("DELETE /api/content/:id/rating")).toHaveLength(1));
        expect(await screen.findByRole("img", { name: "Saver: пока без оценок" })).toBeVisible();
    });
});
