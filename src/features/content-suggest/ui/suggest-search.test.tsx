import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { makeContent, type Suggestions, type TmdbResult } from "@/entities/content";
import { sessionTestOptions, TEST_USER } from "@/entities/session";
import { mockApi, renderWithProviders } from "@/shared/config/tests";
import { SuggestSearch } from "./suggest-search";

afterEach(() => vi.unstubAllGlobals());

const { viewer: _viewer, ...NARUTO } = makeContent({
    id: 7,
    type: "anime",
    title: "Наруто",
    releaseYear: 2002,
    externalRatings: {
        imdb: { id: "tt0409591", rating: 8.4, votes: 1 },
        tmdb: null,
        shikimori: null,
    },
});
const MATRIX: TmdbResult = {
    tmdbId: 603,
    mediaType: "movie",
    type: "film",
    title: "Матрица",
    originalTitle: "The Matrix",
    releaseYear: 1999,
    overview: null,
    posterUrl: null,
    contentId: null,
};

const renderSearch = (onSearch = vi.fn()) => {
    renderWithProviders(
        <Routes>
            <Route
                path="/discover"
                element={<SuggestSearch label="Поиск" value="" onSearch={onSearch} />}
            />
            <Route path="/content/:id" element={<p>details page</p>} />
        </Routes>,
        "/discover",
        sessionTestOptions(TEST_USER),
    );
    return screen.getByRole("combobox", { name: "Поиск" });
};

describe("SuggestSearch", () => {
    it("suggests titles while typing and opens the chosen one with the keyboard", async () => {
        const api = mockApi({
            "GET /api/content/suggest": () => ({
                body: { items: [NARUTO], external: [] } satisfies Suggestions,
            }),
        });
        const onSearch = vi.fn();
        const input = renderSearch(onSearch);

        await userEvent.type(input, "нару");
        const option = await screen.findByRole("option", { name: /Наруто/ });
        expect(option).toHaveTextContent("Аниме · 2002");
        expect(option).toHaveTextContent("IMDb ★ 8.4");
        expect(api.calls("GET /api/content/suggest").at(-1)?.url.searchParams.get("q")).toBe(
            "нару",
        );
        // The catalog below is still filtered by the typed text.
        await vi.waitFor(() => expect(onSearch).toHaveBeenCalledWith("нару"));

        await userEvent.keyboard("{ArrowDown}");
        expect(input).toHaveAttribute("aria-activedescendant", option.id);
        await userEvent.keyboard("{Enter}");
        expect(await screen.findByText("details page")).toBeInTheDocument();
    });

    it("imports a TMDB suggestion on click, closes on Escape", async () => {
        const api = mockApi({
            "GET /api/content/suggest": () => ({ body: { items: [], external: [MATRIX] } }),
            "POST /api/tmdb/import": () => ({
                status: 201,
                body: makeContent({ id: 42, title: "Матрица" }),
            }),
        });
        const input = renderSearch();

        await userEvent.type(input, "матр");
        expect(await screen.findByRole("option", { name: /добавить из TMDB/ })).toBeVisible();
        await userEvent.keyboard("{Escape}");
        expect(screen.queryByRole("listbox")).toBeNull();

        await userEvent.keyboard("{ArrowDown}");
        await userEvent.click(await screen.findByRole("option", { name: /Матрица/ }));
        await vi.waitFor(() => expect(api.calls("POST /api/tmdb/import")).toHaveLength(1));
        expect(api.calls("POST /api/tmdb/import")[0]?.body).toEqual({
            mediaType: "movie",
            tmdbId: 603,
        });
        expect(await screen.findByText("details page")).toBeInTheDocument();
    });
});
