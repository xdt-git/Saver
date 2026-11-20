import { QueryClient } from "@tanstack/react-query";
import { makeContent, makePage } from "../testing";
import { updateContentInCache } from "./cache";

const DUNE = makeContent({ id: 1, title: "Dune" });
const DARK = makeContent({ id: 2, title: "Dark" });

const setup = () => {
    const client = new QueryClient();
    client.setQueryData(["content", "list", {}], makePage([DUNE, DARK]));
    client.setQueryData(["content", "detail", 1], DUNE);
    client.setQueryData(["content", "random", {}, 0], DUNE);
    client.setQueryData(["genres"], [{ slug: "drama", name: "Drama" }]);
    return client;
};

describe("updateContentInCache", () => {
    it("patches the item in every cached place and leaves other items alone", () => {
        const client = setup();
        updateContentInCache(client, 1, (item) => ({ ...item, title: "Dune: Part One" }));

        const page = client.getQueryData<ReturnType<typeof makePage>>(["content", "list", {}]);
        expect(page?.items.map((item) => (item as typeof DUNE).title)).toEqual([
            "Dune: Part One",
            "Dark",
        ]);
        expect(client.getQueryData<typeof DUNE>(["content", "detail", 1])?.title).toBe(
            "Dune: Part One",
        );
        expect(client.getQueryData<typeof DUNE>(["content", "random", {}, 0])?.title).toBe(
            "Dune: Part One",
        );
        expect(client.getQueryData(["genres"])).toEqual([{ slug: "drama", name: "Drama" }]);
    });

    it("refreshes lists and details in the background but never the random pick", () => {
        const client = setup();
        updateContentInCache(client, 1, (item) => item);

        expect(client.getQueryState(["content", "list", {}])?.isInvalidated).toBe(true);
        expect(client.getQueryState(["content", "detail", 1])?.isInvalidated).toBe(true);
        // Refetching it would replace the item the user is looking at.
        expect(client.getQueryState(["content", "random", {}, 0])?.isInvalidated).toBe(false);
    });
});
