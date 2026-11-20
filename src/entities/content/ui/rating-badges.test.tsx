import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/shared/config/tests";
import { makeContent } from "../testing";
import { RatingBadges } from "./rating-badges";

const names = () => screen.getAllByRole("listitem").map((item) => item.getAttribute("title"));

describe("RatingBadges", () => {
    it("shows Saver next to IMDb and Shikimori, with votes in short form", () => {
        const item = makeContent({
            type: "anime",
            rating: { average: 9, count: 3 },
            externalRatings: {
                imdb: { id: "tt0409591", rating: 8.4, votes: 120_000 },
                tmdb: { rating: 8.3, votes: 6000 },
                shikimori: { id: 20, rating: 8.03 },
            },
        });
        renderWithProviders(<RatingBadges item={item} withLinks />);

        expect(names()).toEqual([
            "Saver: 9.0, оценок: 3",
            "IMDb: 8.4, оценок: 120000",
            "Shikimori: 8.03",
        ]);
        expect(screen.getByRole("link", { name: /IMDb/ })).toHaveAttribute(
            "href",
            "https://www.imdb.com/title/tt0409591/",
        );
        expect(screen.getByRole("link", { name: /Shikimori/ })).toHaveAttribute(
            "href",
            "https://shikimori.io/animes/20",
        );
        // TMDB is only the fallback.
        expect(screen.queryByText("TMDB")).toBeNull();
        expect(screen.getByText(/120/)).toBeInTheDocument();
    });

    it("falls back to TMDB without IMDb or Shikimori; cards have no links", () => {
        const item = makeContent({
            externalRatings: { imdb: null, tmdb: { rating: 7.1, votes: 40 }, shikimori: null },
        });
        renderWithProviders(<RatingBadges item={item} />);

        expect(names()).toEqual(["Saver: пока без оценок", "TMDB: 7.1, оценок: 40"]);
        expect(screen.queryByRole("link")).toBeNull();
    });
});
