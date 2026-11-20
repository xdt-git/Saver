/**
 * Domain values shared by several entities (content, library) and the API.
 * Kept in shared so entities do not import each other (FSD).
 */
export const CONTENT_TYPES = ["film", "series", "anime", "cartoon", "game", "other"] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const LIBRARY_STATUSES = ["planned", "watching", "completed"] as const;
export type LibraryStatus = (typeof LIBRARY_STATUSES)[number];

export const RATING_MIN = 1;
export const RATING_MAX = 10;
/** 1, 2, … 10 — options of rating pickers and filters. */
export const RATING_VALUES = Array.from(
    { length: RATING_MAX - RATING_MIN + 1 },
    (_, i) => RATING_MIN + i,
);
