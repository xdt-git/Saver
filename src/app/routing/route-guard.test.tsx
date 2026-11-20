import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { RouteGuard, type RedirectState } from "./route-guard";

const ShowLocation = ({ name }: { name: string }) => {
    const location = useLocation();
    const from = (location.state as RedirectState | null)?.from;
    return (
        <p>
            {name} at {location.pathname}
            {from ? ` from ${from.pathname}${from.search}` : ""}
        </p>
    );
};

const renderRoutes = (path: string, isSignedIn: boolean, state?: RedirectState) =>
    render(
        <MemoryRouter
            initialEntries={[
                {
                    pathname: path.split("?")[0],
                    search: path.includes("?") ? `?${path.split("?")[1]}` : "",
                    state,
                },
            ]}
        >
            <Routes>
                <Route path="/" element={<ShowLocation name="home" />} />
                <Route
                    path="/login"
                    element={
                        <RouteGuard allow={!isSignedIn} redirectTo="/" returnToOrigin>
                            <ShowLocation name="login" />
                        </RouteGuard>
                    }
                />
                <Route element={<RouteGuard allow={isSignedIn} redirectTo="/login" />}>
                    <Route path="/library" element={<ShowLocation name="library" />} />
                    <Route path="/profile" element={<ShowLocation name="profile" />} />
                </Route>
            </Routes>
        </MemoryRouter>,
    );

describe("RouteGuard", () => {
    it("lets a signed-in user open protected pages", () => {
        renderRoutes("/library", true);
        expect(screen.getByText("library at /library")).toBeInTheDocument();
    });

    it("sends a guest to sign-in and remembers the requested page", () => {
        renderRoutes("/profile?tab=stats", false);
        expect(screen.getByText("login at /login from /profile?tab=stats")).toBeInTheDocument();
    });

    it("shows guest-only pages to guests", () => {
        renderRoutes("/login", false);
        expect(screen.getByText("login at /login")).toBeInTheDocument();
    });

    it("returns a signed-in user from a guest-only page to where they came from", () => {
        renderRoutes("/login", true, {
            from: { pathname: "/profile", search: "?tab=stats", hash: "", state: null, key: "x" },
        });
        expect(screen.getByText("profile at /profile")).toBeInTheDocument();
    });

    it("falls back to the default target when there is no origin", () => {
        renderRoutes("/login", true);
        expect(screen.getByText("home at /")).toBeInTheDocument();
    });
});
