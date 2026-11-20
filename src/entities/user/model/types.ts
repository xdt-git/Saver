/** The minimum shown in follower lists and the feed. */
export interface UserSummary {
    id: number;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
}

/** GET /users/:id — what anyone can see. */
export interface PublicProfile extends UserSummary {
    bio: string | null;
    isPrivate: boolean;
    createdAt: string;
    followersCount: number;
    followingCount: number;
    /** Whether the viewer follows this user; null for guests and for the user themself. */
    isFollowing: boolean | null;
}

/** Body of PATCH /users/me. Empty strings clear a field. */
export interface ProfilePatch {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    isPrivate?: boolean;
}

export type FollowListKind = "followers" | "following";

export interface UserPage {
    items: UserSummary[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

/** Name to show: the display name when set, otherwise the username. */
export const displayNameOf = (user: Pick<UserSummary, "displayName" | "username">) =>
    user.displayName ?? user.username;
