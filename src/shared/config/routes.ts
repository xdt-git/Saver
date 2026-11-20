/**
 * All app paths in one place. Components link with ROUTES.x instead of string literals.
 * Pages that do not exist yet (profile) are added together with their pages.
 */
export const ROUTES = {
    home: "/",
    discover: "/discover",
    contentDetails: "/content/:id",
    library: "/Save",
    collection: "/collection",
    profile: "/users/:id",
    feed: "/feed",
    login: "/login",
    register: "/register",
    uiKit: "/ui-kit",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

/** Link to one content item's page. */
export const contentPath = (id: number) => ROUTES.contentDetails.replace(":id", String(id));

/** Link to a user's profile. */
export const profilePath = (id: number) => ROUTES.profile.replace(":id", String(id));
