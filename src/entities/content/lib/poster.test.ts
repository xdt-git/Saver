import { posterSrcSet } from "./poster";

describe("posterSrcSet", () => {
    it("offers TMDB posters in several widths", () => {
        expect(posterSrcSet("https://image.tmdb.org/t/p/w500/abc.jpg")).toBe(
            "https://image.tmdb.org/t/p/w92/abc.jpg 92w, " +
                "https://image.tmdb.org/t/p/w185/abc.jpg 185w, " +
                "https://image.tmdb.org/t/p/w342/abc.jpg 342w, " +
                "https://image.tmdb.org/t/p/w500/abc.jpg 500w",
        );
    });

    it("leaves other images alone", () => {
        expect(posterSrcSet("/api/uploads/posters/abc.webp")).toBeUndefined();
        expect(posterSrcSet("https://img.test/a.png")).toBeUndefined();
    });
});
