import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { makeContent, makePage, type ContentItem } from "@/entities/content";
import type { LibraryEntry } from "@/entities/library";
import { sessionTestOptions, TEST_USER } from "@/entities/session";
import { mockApi, renderWithProviders } from "@/shared/config/tests";
import { EMPTY_COLLECTION_FILTERS, type CollectionFilters } from "../model/filters";
import { CollectionResults } from "./collection-results";

afterEach(() => vi.unstubAllGlobals());

const asUser = sessionTestOptions(TEST_USER);

const entry = (overrides: Partial<LibraryEntry<ContentItem>> = {}): LibraryEntry<ContentItem> => ({
    id: 10,
    status: "completed",
    notes: "Great ending",
    startedAt: null,
    completedAt: "2025-03-15T12:00:00.000Z",
    createdAt: "2025-03-01T00:00:00.000Z",
    updatedAt: "2025-03-15T12:00:00.000Z",
    content: makeContent({
        createdById: TEST_USER.id,
        viewer: { libraryEntryId: 10, status: "completed", rating: 8 },
    }),
    ...overrides,
});

const renderResults = (filters: CollectionFilters, items = [entry()]) => {
    const api = mockApi({
        "GET /api/library": () => ({ body: makePage(items) }),
        "GET /api/genres": () => ({ body: [{ slug: "sci-fi", name: "Science Fiction" }] }),
        "PATCH /api/library/:id": ({ body }) => ({ body: { ...entry(), ...(body as object) } }),
        "DELETE /api/library/:id": () => ({ status: 204 }),
        "PUT /api/content/:id": ({ body }) => ({ body: { ...makeContent(), ...(body as object) } }),
    });
    renderWithProviders(
        <CollectionResults filters={filters} onPageChange={vi.fn()} />,
        "/collection",
        asUser,
    );
    return api;
};

describe("CollectionResults", () => {
    it("shows entries with notes, completion date and the owner's status and rating", async () => {
        const api = renderResults({
            ...EMPTY_COLLECTION_FILTERS,
            status: "completed",
            search: " dune ",
        });

        const card = await screen.findByRole("article", { name: "Dune" });
        expect(within(card).getByText("Great ending")).toBeInTheDocument();
        expect(within(card).getByText(/^Завершено/)).toBeInTheDocument();
        expect(within(card).getByRole("button", { name: "Просмотрено" })).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        expect(within(card).getByLabelText("Оценка «Dune»")).toHaveValue("8");

        const query = api.calls("GET /api/library")[0]?.url.searchParams;
        expect(query?.get("status")).toBe("completed");
        expect(query?.get("search")).toBe("dune");
        expect(query?.get("sort")).toBe("updatedAt");
    });

    it("offers editing only for the user's own manual content", async () => {
        const foreign = entry({ content: makeContent({ createdById: 999 }) });
        renderResults(EMPTY_COLLECTION_FILTERS, [foreign]);
        const card = await screen.findByRole("article", { name: "Dune" });
        expect(within(card).queryByRole("button", { name: "Редактировать" })).toBeNull();
        expect(within(card).getByRole("button", { name: "Заметка" })).toBeInTheDocument();
    });

    it.each([
        [EMPTY_COLLECTION_FILTERS, "В библиотеке пока пусто"],
        [
            { ...EMPTY_COLLECTION_FILTERS, status: "watching" as const },
            "Здесь пока ничего нет: Смотрю",
        ],
        [
            { ...EMPTY_COLLECTION_FILTERS, type: "series" as const, status: "planned" as const },
            "Здесь пока ничего нет: Сериал, В планах",
        ],
        [{ ...EMPTY_COLLECTION_FILTERS, search: "zzz" }, "Ничего не нашлось"],
    ])("explains an empty list (%o)", async (filters, title) => {
        renderResults(filters, []);
        expect(await screen.findByText(title)).toBeInTheDocument();
    });

    it("links an empty library to the catalog", async () => {
        renderResults(EMPTY_COLLECTION_FILTERS, []);
        expect(await screen.findByRole("link", { name: "Открыть каталог" })).toHaveAttribute(
            "href",
            "/discover",
        );
    });
});

describe("Entry actions", () => {
    it("removes an entry only after confirmation", async () => {
        const api = renderResults(EMPTY_COLLECTION_FILTERS);
        const card = await screen.findByRole("article", { name: "Dune" });

        await userEvent.click(within(card).getByRole("button", { name: "Удалить" }));
        const dialog = screen.getByRole("dialog", { name: "Убрать из библиотеки?" });
        await userEvent.click(within(dialog).getByRole("button", { name: "Отмена" }));
        expect(api.calls("DELETE /api/library/:id")).toHaveLength(0);

        await userEvent.click(within(card).getByRole("button", { name: "Удалить" }));
        await userEvent.click(screen.getByRole("button", { name: "Убрать" }));
        await vi.waitFor(() => expect(api.calls("DELETE /api/library/:id")).toHaveLength(1));
        expect(api.calls("DELETE /api/library/:id")[0]?.params.id).toBe("10");
        expect(await screen.findByText("«Dune» убрано из библиотеки")).toBeInTheDocument();
    });

    it("edits the note and the completion date", async () => {
        const api = renderResults(EMPTY_COLLECTION_FILTERS);
        const card = await screen.findByRole("article", { name: "Dune" });
        await userEvent.click(within(card).getByRole("button", { name: "Заметка" }));

        const dialog = screen.getByRole("dialog");
        const notes = within(dialog).getByLabelText("Ваша заметка");
        await userEvent.clear(notes);
        await userEvent.type(notes, "Watch again");
        const date = within(dialog).getByLabelText("Дата завершения");
        await userEvent.clear(date);
        await userEvent.type(date, "2024-12-31");
        await userEvent.click(within(dialog).getByRole("button", { name: "Сохранить" }));

        await vi.waitFor(() => expect(api.calls("PATCH /api/library/:id")).toHaveLength(1));
        expect(api.calls("PATCH /api/library/:id")[0]?.body).toEqual({
            notes: "Watch again",
            completedAt: "2024-12-31T12:00:00.000Z",
        });
    });

    it("edits own content with the prefilled form (PUT)", async () => {
        const api = renderResults(EMPTY_COLLECTION_FILTERS);
        const card = await screen.findByRole("article", { name: "Dune" });
        await userEvent.click(within(card).getByRole("button", { name: "Редактировать" }));

        const dialog = screen.getByRole("dialog", { name: "Редактирование" });
        const title = within(dialog).getByLabelText("Название");
        expect(title).toHaveValue("Dune");
        await userEvent.clear(title);
        await userEvent.type(title, "Dune: Part One");
        await userEvent.click(within(dialog).getByRole("button", { name: "Сохранить" }));

        await vi.waitFor(() => expect(api.calls("PUT /api/content/:id")).toHaveLength(1));
        expect(api.calls("PUT /api/content/:id")[0]?.body).toMatchObject({
            title: "Dune: Part One",
            type: "film",
            runtimeMinutes: 155,
            genres: ["sci-fi"],
        });
    });
});
