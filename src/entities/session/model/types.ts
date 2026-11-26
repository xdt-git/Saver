/** The signed-in user as the API returns it (GET /auth/me). */
export interface SessionUser {
    id: number;
    /** Null for accounts made in the Telegram bot. */
    email: string | null;
    username: string;
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    isPrivate: boolean;
    /** Whether the email address was confirmed through the emailed link. */
    emailVerified: boolean;
    notifications: NotificationSettings;
    /** The linked Telegram account; null when the bot is not connected. */
    telegram: { username: string | null } | null;
    /** Accounts made in Telegram have no password. */
    hasPassword: boolean;
    createdAt: string;
}

/** consent is null until the user answered the one-time question. */
export interface NotificationSettings {
    consent: boolean | null;
    following: boolean;
    likes: boolean;
    comments: boolean;
    /** Copies in the Telegram bot. */
    telegram: boolean;
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

/** What the "Log in with Telegram" widget returns (signed by Telegram). */
export interface TelegramLoginPayload {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
}

/** Sign-in methods besides the password. */
export interface AuthProviders {
    /** Google's public client id. */
    google: string | null;
    /** The Telegram bot's username. */
    telegram: string | null;
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
