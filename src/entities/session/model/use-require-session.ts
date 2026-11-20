import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/config/routes";
import { useSession } from "./session-context";

/**
 * Wraps an action that needs an account: guests are sent to the login page and brought
 * back here afterwards; signed-in users run the action.
 */
export const useRequireSession = () => {
    const { status } = useSession();
    const navigate = useNavigate();
    const location = useLocation();

    return <A extends unknown[]>(action: (...args: A) => void) =>
        (...args: A) => {
            if (status === "authenticated") action(...args);
            else navigate(ROUTES.login, { state: { from: location } });
        };
};
