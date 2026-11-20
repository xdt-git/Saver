/** The signed-in user as the API returns it (GET /auth/me). */
export interface SessionUser {
    id: number;
    email: string;
    username: string;
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    isPrivate: boolean;
    createdAt: string;
}

export interface LoginPayload {
    /** Email or username. */
    login: string;
    password: string;
}

export interface RegisterPayload {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
}

/** "loading" until the first /auth/me answer, so guards do not redirect too early. */
export type SessionStatus = "loading" | "authenticated" | "guest";
