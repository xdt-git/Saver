import type { Activity } from "./api/activity-api";

/** A feed event for tests; override any field. */
export const makeActivity = (overrides: Partial<Activity> = {}): Activity => ({
    id: 1,
    type: "rated",
    payload: { value: 9 },
    createdAt: new Date().toISOString(),
    user: { id: 2, username: "trinity", displayName: "Trinity", avatarUrl: null },
    content: { id: 1, title: "The Matrix", type: "film", posterUrl: null },
    social: { likes: 0, liked: false, comments: 0, latestComments: [] },
    ...overrides,
});
