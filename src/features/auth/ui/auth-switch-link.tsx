import { Link, useLocation } from "react-router-dom";

interface AuthSwitchLinkProps {
    question: string;
    to: string;
    label: string;
}

/**
 * "No account yet? Sign up" under the form. Keeps the router state, so the page the user
 * originally wanted is still the one they return to after signing up instead of in.
 */
export const AuthSwitchLink = ({ question, to, label }: AuthSwitchLinkProps) => {
    const { state } = useLocation();
    return (
        <>
            {question}{" "}
            <Link to={to} state={state}>
                {label}
            </Link>
        </>
    );
};
