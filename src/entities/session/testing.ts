import type { RenderOptions } from "@/shared/config/tests";
import { sessionKeys } from "./api/session-api";
import { AuthProvider } from "./model/auth-provider";
import type { SessionUser } from "./model/types";

/** A signed-in user for tests. */
export const TEST_USER: SessionUser = {
    id: 1,
    email: "neo@matrix.io",
    username: "neo",
    displayName: null,
    bio: null,
    avatarUrl: null,
    isPrivate: false,
    createdAt: "2026-01-01T00:00:00.000Z",
};

/**
 * renderWithProviders options with the session already known (no /auth/me request):
 *   renderWithProviders(<Header />, "/", sessionTestOptions(TEST_USER))
 *   renderWithProviders(<Layout />, "/Save", sessionTestOptions(null)) // guest
 */
export const sessionTestOptions = (user: SessionUser | null): RenderOptions => ({
    wrapper: AuthProvider,
    setup: (queryClient) => {
        queryClient.setQueryData<SessionUser | null>(sessionKeys.me(), user);
    },
});
