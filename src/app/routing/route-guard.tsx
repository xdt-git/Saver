import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation, type Location } from "react-router-dom";

export interface RouteGuardProps {
    /** Whether the current user may see this route. */
    allow: boolean;
    /** Where to send the user otherwise. */
    redirectTo: string;
    /**
     * Send the user back to the page they came from (saved in `state.from` by a previous
     * redirect) instead of `redirectTo`. Used after sign-in on guest-only pages.
     */
    returnToOrigin?: boolean;
    /** Content to guard; without it the guard wraps nested routes through <Outlet />. */
    children?: ReactNode;
}

export interface RedirectState {
    from?: Location;
}

/**
 * Access control for routes. The session status is passed in from outside
 * (the AuthProvider in C7), so the guard itself holds no auth logic:
 *   protected pages: <RouteGuard allow={isSignedIn} redirectTo={ROUTES.login} />
 *   guest-only pages: <RouteGuard allow={!isSignedIn} redirectTo={ROUTES.home} returnToOrigin />
 */
export const RouteGuard = ({
    allow,
    redirectTo,
    returnToOrigin = false,
    children,
}: RouteGuardProps) => {
    const location = useLocation();

    if (allow) return children ? <>{children}</> : <Outlet />;

    if (returnToOrigin) {
        const origin = (location.state as RedirectState | null)?.from;
        const target = origin ? `${origin.pathname}${origin.search}${origin.hash}` : redirectTo;
        return <Navigate to={target} replace />;
    }

    // Remember where the user wanted to go, to return there after signing in.
    return <Navigate to={redirectTo} replace state={{ from: location } satisfies RedirectState} />;
};
