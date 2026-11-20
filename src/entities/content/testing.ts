import type { ContentItem, Page } from "./model/types";

/** A catalog item for tests; override any field. */
export const makeContent = (overrides: Partial<ContentItem> = {}): ContentItem => ({
    id: 1,
    type: "film",
    title: "Dune",
    originalTitle: null,
    titleEn: null,
    description: "Spice must flow.",
    posterUrl: null,
    releaseYear: 2021,
    runtimeMinutes: 155,
    episodeCount: null,
    episodeRuntimeMinutes: null,
    source: "manual",
    genres: [{ slug: "sci-fi", name: "Science Fiction" }],
    rating: { average: null, count: 0 },
    externalRatings: { imdb: null, tmdb: null, shikimori: null },
    popularity: 0,
    createdById: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    viewer: null,
    ...overrides,
});

export const makePage = <T>(
    items: T[],
    page = 1,
    pageSize = 12,
    total = items.length,
): Page<T> => ({
    items,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
});
