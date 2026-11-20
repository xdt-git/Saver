import { parseCollectionFilters, serializeCollectionFilters } from "./use-collection-filters";

describe("library filters in the URL", () => {
    it("round-trips and ignores broken values", () => {
        const params = new URLSearchParams(
            "status=completed&type=game&genre=drama&q=x&sort=title&page=2",
        );
        expect(serializeCollectionFilters(parseCollectionFilters(params)).toString()).toBe(
            params.toString(),
        );
        expect(parseCollectionFilters(new URLSearchParams("status=dropped&page=0"))).toMatchObject({
            status: undefined,
            page: 1,
            sort: "updated",
        });
    });
});
