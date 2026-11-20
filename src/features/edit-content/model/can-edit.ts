import type { ContentItem } from "@/entities/content";

/** Only the author can edit manually added content (the API checks it too). */
export const canEditContent = (item: ContentItem, userId: number | undefined) =>
    item.source === "manual" && userId !== undefined && item.createdById === userId;
