import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { setSessionExpiredHandler } from "@/shared/api";
import { useToast } from "@/shared/ui/toast";
import { sessionApi, sessionKeys } from "../api/session-api";
import { SessionContext, type SessionApi } from "./session-context";
import type { SessionStatus, SessionUser } from "./types";

/**
 * Holds the current user (from GET /auth/me) for the whole app.
 * - Signing in stores the returned user right away, no extra request.
 * - Signing out ends the server session and drops every cached query (private data).
 * - When a refresh fails mid-session, the user becomes a guest and is told so once.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const { t } = useTranslation();

    const { data, isPending } = useQuery({
        queryKey: sessionKeys.me(),
        queryFn: sessionApi.me,
        staleTime: Infinity,
        retry: false,
    });
    const user = data ?? null;
    const status: SessionStatus = isPending ? "loading" : user ? "authenticated" : "guest";

    const setUser = useCallback(
        (next: SessionUser | null) => queryClient.setQueryData(sessionKeys.me(), next),
        [queryClient],
    );

    /** Becomes a guest: drops every other cached query (private data), keeps no refetch. */
    const becomeGuest = useCallback(() => {
        queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== "session" });
        setUser(null);
    }, [queryClient, setUser]);

    // The API client calls this when a 401 cannot be fixed by refreshing the session.
    const wasSignedIn = useRef(false);
    wasSignedIn.current = user !== null;
    useEffect(() => {
        setSessionExpiredHandler(() => {
            if (wasSignedIn.current) toast.warning(t("auth.sessionExpired"));
            becomeGuest();
        });
        return () => setSessionExpiredHandler(null);
    }, [becomeGuest, t, toast]);

    const signOut = useCallback(async () => {
        try {
            await sessionApi.logout();
        } finally {
            // Even if the request fails, nothing private stays on screen.
            becomeGuest();
        }
    }, [becomeGuest]);

    /**
     * Stores the signed-in user. When the person changes (guest → user, or another account),
     * data loaded before (catalog "viewer", "following" flags) is refetched for them.
     */
    const signIn = useCallback(
        (next: SessionUser) => {
            const previous = queryClient.getQueryData<SessionUser | null>(sessionKeys.me());
            setUser(next);
            if (previous?.id !== next.id) {
                void queryClient.invalidateQueries({
                    predicate: (query) => query.queryKey[0] !== "session",
                });
            }
        },
        [queryClient, setUser],
    );

    const value = useMemo<SessionApi>(
        () => ({ user, status, signIn, signOut }),
        [user, status, signIn, signOut],
    );

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};
