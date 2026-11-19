export const CATEGORY_IDS = ["film", "series", "anime", "cartoon", "game"] as const;

/** Content category id; its texts live in translations under categories.<id>. */
export type CategoryId = (typeof CATEGORY_IDS)[number];

/** Content category shown on the library page (films, series, anime, cartoons, games). */
export interface Category {
    id: CategoryId;
    imgBlue: string;
    imgPink: string;
}
