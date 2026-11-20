import type { QueryClient } from "@tanstack/react-query";
import type { ContentItem, Page } from "./types";

const isPage = (data: unknown): data is Page<ContentItem> =>
    typeof data === "object" && data !== null && "items" in data;

const isItem = (data: unknown): data is ContentItem =>
    typeof data === "object" && data !== null && "id" in data && "title" in data;

/**
 * Applies a change to one item everywhere it is cached (list pages, details, random pick),
 * so cards update at once. Then refreshes lists and details in the background for exact
 * numbers; the random pick is only patched, never refetched, so it does not jump away.
 */
export const updateContentInCache = (
    queryClient: QueryClient,
    contentId: number,
    update: (item: ContentItem) => ContentItem,
) => {
    const patch = (item: ContentItem) => (item.id === contentId ? update(item) : item);
    queryClient.setQueriesData<unknown>({ queryKey: ["content"] }, (data: unknown) => {
        if (isPage(data)) return { ...data, items: data.items.map(patch) };
        if (isItem(data)) return patch(data);
        return data;
    });
    void queryClient.invalidateQueries({
        queryKey: ["content"],
        predicate: (query) => query.queryKey[1] !== "random",
    });
};
