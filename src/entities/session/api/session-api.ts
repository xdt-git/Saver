import { apiClient, isApiError } from "@/shared/api";
import { currentLanguage } from "@/shared/config/i18n";
import type {
    ForgotPasswordPayload,
    LoginPayload,
    RegisterRequest,
    ResetPasswordPayload,
    SessionUser,
} from "../model/types";

export const sessionKeys = {
    me: () => ["session", "me"] as const,
};

// These requests handle 401 themselves: a wrong password or a guest visit is not an
// expired session, so the client must not run its global refresh and expiry logic.
const authOnly = { skipAuthRefresh: true } as const;

const isUnauthorized = (error: unknown) => isApiError(error) && error.status === 401;

/** GET /auth/session: never a 401, so a guest visit logs no errors in the console. */
interface SessionState {
    user: SessionUser | null;
    /** An expired access token can be renewed with the refresh cookie. */
    canRefresh: boolean;
}

const fetchSession = () => apiClient.get<SessionState>("/auth/session", authOnly);

export const sessionApi = {
    /**
     * The signed-in user, or null for a guest. An expired access token is renewed once
     * with the refresh cookie before giving up.
     */
    me: async (): Promise<SessionUser | null> => {
        const first = await fetchSession();
        if (first.user || !first.canRefresh) return first.user;
        try {
            await apiClient.post<null>("/auth/refresh", undefined, authOnly);
        } catch (error) {
            // The refresh cookie was stale: a guest after all.
            if (isUnauthorized(error)) return null;
            throw error;
        }
        return (await fetchSession()).user;
    },
    login: (payload: LoginPayload) => apiClient.post<SessionUser>("/auth/login", payload, authOnly),
    /** The verification email is written in the current UI language. */
    register: (payload: RegisterRequest) =>
        apiClient.post<SessionUser>(
            "/auth/register",
            { ...payload, language: currentLanguage() },
            authOnly,
        ),
    logout: () => apiClient.post<void>("/auth/logout", undefined, authOnly),
    verifyEmail: (token: string) => apiClient.post<null>("/auth/email/verify", { token }, authOnly),
    resendVerification: () =>
        apiClient.post<{ alreadyVerified: boolean }>("/auth/email/resend", {
            language: currentLanguage(),
        }),
    /** Answers the same whether or not the email is registered. */
    forgotPassword: ({ email }: ForgotPasswordPayload) =>
        apiClient.post<null>(
            "/auth/password/forgot",
            { email: email.trim().toLowerCase(), language: currentLanguage() },
            authOnly,
        ),
    /** Ends every session; the user signs in again with the new password. */
    resetPassword: (token: string, payload: ResetPasswordPayload) =>
        apiClient.post<null>("/auth/password/reset", { token, ...payload }, authOnly),
};
