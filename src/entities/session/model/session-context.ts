import { createContext, useContext } from "react";
import type { SessionStatus, SessionUser } from "./types";

export interface SessionApi {
    user: SessionUser | null;
    status: SessionStatus;
    /** Stores the user returned by login or register. */
    signIn: (user: SessionUser) => void;
    /** Ends the session on the server and clears all cached private data. */
    signOut: () => Promise<void>;
}

export const SessionContext = createContext<SessionApi | null>(null);

/** Current session. Must be used inside <AuthProvider>. */
export const useSession = (): SessionApi => {
    const session = useContext(SessionContext);
    if (!session) throw new Error("useSession must be used inside <AuthProvider>");
    return session;
};
