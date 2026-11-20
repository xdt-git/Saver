import { parseFilters, serializeFilters } from "./use-url-filters";

describe("catalog filters in the URL", () => {
    it("reads every filter and round-trips", () => {
        const params = new URLSearchParams(
            "q=dune&type=film&genre=sci-fi&from=2000&to=2024&rating=7&sort=rating&page=3",
        );
        const filters = parseFilters(params);
        expect(filters).toEqual({
            search: "dune",
            type: "film",
            genre: "sci-fi",
            yearFrom: 2000,
            yearTo: 2024,
            minRating: 7,
            sort: "rating",
            page: 3,
        });
        expect(serializeFilters(filters).toString()).toBe(params.toString());
    });

    it("ignores broken values instead of failing", () => {
        expect(parseFilters(new URLSearchParams("type=book&from=abc&sort=x&page=-2"))).toEqual({
            search: "",
            type: undefined,
            genre: undefined,
            yearFrom: undefined,
            yearTo: undefined,
            minRating: undefined,
            sort: "popular",
            page: 1,
        });
    });

    it("keeps a clean URL for the defaults", () => {
        expect(serializeFilters(parseFilters(new URLSearchParams())).toString()).toBe("");
    });
});
