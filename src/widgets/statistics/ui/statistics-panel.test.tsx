import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { makeContent, type ContentItem } from "@/entities/content";
import { sessionTestOptions } from "@/entities/session";
import type { Statistics } from "@/entities/statistics";
import { apiFailure, mockApi, renderWithProviders } from "@/shared/config/tests";
import { StatisticsPanel } from "./statistics-panel";

afterEach(() => vi.unstubAllGlobals());

const months = Array.from({ length: 12 }, (_, i) => ({
    month: `2026-${String(i + 1).padStart(2, "0")}`,
    completed: i === 10 ? 4 : i === 9 ? 1 : 0,
}));

const stats = (overrides: Partial<Statistics<ContentItem>> = {}): Statistics<ContentItem> => ({
    library: { planned: 2, watching: 1, completed: 5, total: 8 },
    completed: {
        total: 5,
        byType: { film: 3, series: 2, anime: 0, dorama: 0, cartoon: 0, game: 0, other: 0 },
    },
    watchTime: { minutes: 125 * 60 + 30, itemsWithDuration: 4, itemsWithoutDuration: 1 },
    ratings: { average: 8.25, count: 4 },
    favoriteGenres: [
        { slug: "sci-fi", name: "Science Fiction", count: 4 },
        { slug: "drama", name: "Drama", count: 1 },
    ],
    activity: { last7Days: 3, last30Days: 11 },
    monthly: months,
    topContent: [{ value: 10, content: makeContent({ id: 7, title: "The Matrix" }) }],
    social: { followersCount: 1, followingCount: 2 },
    ...overrides,
});

const renderPanel = (reply: () => ReturnType<typeof apiFailure> | { body: unknown }) => {
    mockApi({ "GET /api/users/:id/statistics": reply });
    renderWithProviders(<StatisticsPanel userId={2} />, "/", sessionTestOptions(null));
};

describe("StatisticsPanel", () => {
    it("shows the headline numbers, real watch time only, with plural forms", async () => {
        renderPanel(() => ({ body: stats() }));

        expect(await screen.findByText("125 ч 30 мин")).toBeInTheDocument();
        expect(screen.getByText("без 1 записи: длительность неизвестна")).toBeInTheDocument();
        expect(screen.getByText("8 записей в библиотеке")).toBeInTheDocument();
        expect(screen.getByText("★ 8.3")).toBeInTheDocument();
        expect(screen.getByText("4 оценки")).toBeInTheDocument();
        expect(screen.getByText("11 действий за 30 дней")).toBeInTheDocument();
    });

    it("draws 12 months with a tooltip per column and a table view", async () => {
        renderPanel(() => ({ body: stats() }));
        const chart = await screen.findByRole("group", { name: "Завершено по месяцам" });
        const columns = within(chart).getAllByRole("button");
        expect(columns).toHaveLength(12);
        expect(columns[10]).toHaveAccessibleName("ноябрь 2026 г.: 4 завершено");

        await userEvent.hover(columns[9] as HTMLElement);
        expect(screen.getByRole("tooltip")).toHaveTextContent("октябрь 2026 г.1 завершено");

        await userEvent.click(screen.getByText("Показать таблицей"));
        expect(screen.getByRole("rowheader", { name: "ноябрь 2026 г." })).toBeInTheDocument();
    });

    it("ranks categories and genres, hides empty categories, lists top content", async () => {
        renderPanel(() => ({ body: stats() }));
        const categories = await screen.findByRole("list", { name: "По категориям" });
        expect(
            within(categories)
                .getAllByRole("listitem")
                .map((li) => li.textContent),
        ).toEqual(["Фильм3", "Сериал2"]);
        const genres = screen.getByRole("list", { name: "Любимые жанры" });
        expect(within(genres).getAllByRole("listitem")[0]).toHaveTextContent("Фантастика4");
        expect(screen.getByRole("link", { name: "The Matrix" })).toHaveAttribute(
            "href",
            "/content/7",
        );
    });

    it("explains an empty library and a private profile", async () => {
        renderPanel(() => ({
            body: stats({ library: { planned: 0, watching: 0, completed: 0, total: 0 } }),
        }));
        expect(await screen.findByText("Статистики пока нет")).toBeInTheDocument();
    });

    it("says a private profile's statistics are closed", async () => {
        renderPanel(() => apiFailure(403, "FORBIDDEN"));
        expect(await screen.findByText("Профиль закрыт")).toBeInTheDocument();
    });

    it("shows a dash when nothing is rated and no note when all durations are known", async () => {
        renderPanel(() => ({
            body: stats({
                ratings: { average: null, count: 0 },
                watchTime: { minutes: 90, itemsWithDuration: 5, itemsWithoutDuration: 0 },
            }),
        }));
        expect(await screen.findByText("1 ч 30 мин")).toBeInTheDocument();
        expect(screen.getByText("—")).toBeInTheDocument();
        expect(screen.queryByText(/длительность неизвестна/)).toBeNull();
    });
});
