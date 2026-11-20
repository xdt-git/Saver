import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { makeContent } from "@/entities/content";
import { sessionTestOptions, TEST_USER } from "@/entities/session";
import { apiFailure, mockApi, renderWithProviders } from "@/shared/config/tests";
import type { TmdbResult } from "../api/tmdb-api";
import { TmdbSearch } from "./tmdb-search";

afterEach(() => vi.unstubAllGlobals());

const MATRIX: TmdbResult = {
    tmdbId: 603,
    mediaType: "movie",
    type: "film",
    title: "Матрица",
    originalTitle: "The Matrix",
    releaseYear: 1999,
    overview: "Хакер Нео узнаёт правду.",
    posterUrl: "https://image.tmdb.org/t/p/w500/matrix.jpg",
    contentId: null,
};

const renderSearch = (user: typeof TEST_USER | null, initialQuery = "матрица") =>
    renderWithProviders(
        <Routes>
            <Route path="/discover" element={<TmdbSearch initialQuery={initialQuery} />} />
            <Route path="/content/:id" element={<p>details page</p>} />
        </Routes>,
        "/discover",
        sessionTestOptions(user),
    );

describe("TmdbSearch", () => {
    it("is hidden for guests and when the server has no TMDB token", async () => {
        mockApi({ "GET /api/tmdb/status": () => ({ body: { enabled: true } }) });
        renderSearch(null);
        expect(screen.queryByText("Нет нужного? Найти в TMDB")).toBeNull();

        vi.unstubAllGlobals();
        mockApi({ "GET /api/tmdb/status": () => ({ body: { enabled: false } }) });
        renderSearch(TEST_USER);
        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(screen.queryByText("Нет нужного? Найти в TMDB")).toBeNull();
    });

    it("searches with the catalog text and imports the chosen item, then opens it", async () => {
        const api = mockApi({
            "GET /api/tmdb/status": () => ({ body: { enabled: true } }),
            "GET /api/tmdb/search": () => ({ body: { items: [MATRIX], page: 1, totalPages: 1 } }),
            "POST /api/tmdb/import": () => ({
                status: 201,
                body: makeContent({ id: 42, title: "Матрица", source: "tmdb" }),
            }),
        });
        renderSearch(TEST_USER);

        const row = (await screen.findByText("Матрица")).closest("li") as HTMLElement;
        expect(within(row).getByText("Фильм · 1999 · The Matrix")).toBeInTheDocument();
        expect(api.calls("GET /api/tmdb/search")[0]?.url.searchParams.get("query")).toBe("матрица");
        expect(api.calls("GET /api/tmdb/search")[0]?.url.searchParams.get("language")).toBe("ru");

        await userEvent.click(
            within(row).getByRole("button", { name: "Добавить «Матрица» в каталог" }),
        );
        expect(await screen.findByText("details page")).toBeInTheDocument();
        expect(api.calls("POST /api/tmdb/import")[0]?.body).toEqual({
            mediaType: "movie",
            tmdbId: 603,
        });
        expect(screen.getByText("«Матрица» в каталоге")).toBeInTheDocument();
    });

    it("opens an item that is already in the catalog without importing again", async () => {
        const api = mockApi({
            "GET /api/tmdb/status": () => ({ body: { enabled: true } }),
            "GET /api/tmdb/search": () => ({
                body: { items: [{ ...MATRIX, contentId: 7 }], page: 1, totalPages: 1 },
            }),
        });
        renderSearch(TEST_USER);
        await userEvent.click(await screen.findByRole("button", { name: "Открыть «Матрица»" }));
        expect(await screen.findByText("details page")).toBeInTheDocument();
        expect(api.calls("POST /api/tmdb/import")).toHaveLength(0);
    });

    it("explains an empty query, no results and an unavailable TMDB", async () => {
        mockApi({
            "GET /api/tmdb/status": () => ({ body: { enabled: true } }),
            "GET /api/tmdb/search": ({ url }) =>
                url.searchParams.get("query") === "zzz"
                    ? { body: { items: [], page: 1, totalPages: 0 } }
                    : apiFailure(503, "SERVICE_UNAVAILABLE"),
        });
        renderSearch(TEST_USER, "");
        expect(await screen.findByText(/Введите название/)).toBeInTheDocument();

        await userEvent.type(screen.getByLabelText("Поиск в TMDB"), "zzz");
        expect(await screen.findByText("В TMDB ничего не нашлось")).toBeInTheDocument();

        await userEvent.clear(screen.getByLabelText("Поиск в TMDB"));
        await userEvent.type(screen.getByLabelText("Поиск в TMDB"), "down");
        expect(await screen.findByText("Поиск в TMDB сейчас недоступен")).toBeInTheDocument();
        expect(screen.getByText("Данные предоставлены TMDB.")).toBeInTheDocument();
    });
});
