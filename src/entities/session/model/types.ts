/** The signed-in user as the API returns it (GET /auth/me). */
export interface SessionUser {
    id: number;
    email: string;
    username: string;
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    isPrivate: boolean;
    /** Whether the email address was confirmed through the emailed link. */
    emailVerified: boolean;
    notifications: NotificationSettings;
    createdAt: string;
}

/** consent is null until the user answered the one-time question. */
export interface NotificationSettings {
    consent: boolean | null;
    following: boolean;
    likes: boolean;
    comments: boolean;
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

/** The sign-up form with the answer of its notifications checkbox. */
export interface RegisterRequest extends RegisterPayload {
    notificationsConsent: boolean;
}

export interface GoogleSignInPayload {
    credential: string;
    notificationsConsent?: boolean;
}

export interface ForgotPasswordPayload {
    email: string;
}

export interface ResetPasswordPayload {
    password: string;
    confirmPassword: string;
}

/** "loading" until the first /auth/me answer, so guards do not redirect too early. */
export type SessionStatus = "loading" | "authenticated" | "guest";
