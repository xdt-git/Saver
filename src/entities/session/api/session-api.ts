import { apiClient, isApiError } from "@/shared/api";
import { currentLanguage } from "@/shared/config/i18n";
import type {
    ForgotPasswordPayload,
    LoginPayload,
    RegisterPayload,
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

const fetchMe = () => apiClient.get<SessionUser>("/auth/me", authOnly);

export const sessionApi = {
    /**
     * The signed-in user, or null for a guest. An expired access token is renewed once
     * with the refresh cookie before giving up.
     */
    me: async (): Promise<SessionUser | null> => {
        try {
            return await fetchMe();
        } catch (error) {
            if (!isUnauthorized(error)) throw error;
        }
        try {
            await apiClient.post<null>("/auth/refresh", undefined, authOnly);
            return await fetchMe();
        } catch (error) {
            if (isUnauthorized(error)) return null;
            throw error;
        }
    },
    login: (payload: LoginPayload) => apiClient.post<SessionUser>("/auth/login", payload, authOnly),
    /** The verification email is written in the current UI language. */
    register: (payload: RegisterPayload) =>
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
