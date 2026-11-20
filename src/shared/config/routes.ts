/**
 * All app paths in one place. Components link with ROUTES.x instead of string literals.
 * Pages that do not exist yet (login, register, profile) are added together with their pages.
 */
export const ROUTES = {
    home: "/",
    discover: "/discover",
    library: "/Save",
    uiKit: "/ui-kit",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
