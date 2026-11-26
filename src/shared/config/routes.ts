/**
 * All app paths in one place. Components link with ROUTES.x instead of string literals.
 * Pages that do not exist yet (profile) are added together with their pages.
 */
export const ROUTES = {
    home: "/",
    discover: "/discover",
    contentDetails: "/content/:id",
    /** Old address of the library: redirects to the collection. */
    legacyLibrary: "/Save",
    collection: "/collection",
    profile: "/users/:id",
    feed: "/feed",
    /** People search and everyone's activity; the following tab is ?tab=following. */
    news: "/news",
    /** The signed-in user's notifications and their settings. */
    notifications: "/notifications",
    login: "/login",
    register: "/register",
    forgotPassword: "/forgot-password",
    /** Pages opened from email links (?token=...); the API builds the same paths. */
    resetPassword: "/reset-password",
    verifyEmail: "/verify-email",
    /** Opened from the Telegram bot (?code=...): links the bot to the signed-in account. */
    telegramLink: "/telegram/link",
    /** Privacy policy (also the link Google shows on its sign-in screen). */
    privacy: "/privacy",
    uiKit: "/ui-kit",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

/** Link to one content item's page. */
export const contentPath = (id: number) => ROUTES.contentDetails.replace(":id", String(id));

/** The news page opened on the people the user follows. */
export const NEWS_FOLLOWING_PATH = `${ROUTES.news}?tab=following`;

/** Link to a user's profile. */
export const profilePath = (id: number) => ROUTES.profile.replace(":id", String(id));
