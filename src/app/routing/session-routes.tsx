import { useSession } from "@/entities/session";
import { ROUTES } from "@/shared/config/routes";
import { PageLoader } from "@/shared/ui/loader";
import { RouteGuard } from "./route-guard";

/** Signed-in users only; guests go to the login page and come back after signing in. */
export const ProtectedRoutes = () => {
    const { status } = useSession();
    // Wait for the first /auth/me answer, so nobody is redirected too early.
    if (status === "loading") return <PageLoader />;
    return <RouteGuard allow={status === "authenticated"} redirectTo={ROUTES.login} />;
};

/** Guests only (login, register); after signing in the user returns to where they came from. */
export const GuestRoutes = () => {
    const { status } = useSession();
    if (status === "loading") return <PageLoader />;
    return <RouteGuard allow={status === "guest"} redirectTo={ROUTES.home} returnToOrigin />;
};
