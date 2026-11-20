import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { sessionKeys, sessionTestOptions, TEST_USER, useSession } from "@/entities/session";
import { ROUTES } from "@/shared/config/routes";
import { renderWithProviders } from "@/shared/config/tests";
import { ProfileMenu } from "./profile-menu";

/** Minimal protected area with the profile menu inside, like a guarded page. */
const RequireUser = () => {
    const { user } = useSession();
    if (!user) return <Navigate to={ROUTES.login} replace />;
    return (
        <>
            <ProfileMenu />
            <Outlet />
        </>
    );
};

const fetchMock = vi.fn<typeof fetch>();
beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

const renderMenu = (user: typeof TEST_USER | null, path = "/Save") =>
    renderWithProviders(
        <>
            <ProfileMenu />
            <Routes>
                <Route path={ROUTES.home} element={<p>home page</p>} />
                <Route path="*" element={<p>other page</p>} />
            </Routes>
        </>,
        path,
        sessionTestOptions(user),
    );

describe("ProfileMenu", () => {
    it("links guests to the login page", () => {
        renderMenu(null);
        expect(screen.getByRole("link", { name: "Войти" })).toHaveAttribute("href", ROUTES.login);
    });

    it("opens a menu with the user's name and closes on Escape", async () => {
        renderMenu(TEST_USER);
        const trigger = screen.getByRole("button", { name: "Меню профиля neo" });

        await userEvent.click(trigger);
        expect(trigger).toHaveAttribute("aria-expanded", "true");
        expect(screen.getByRole("menu")).toHaveTextContent("@neo");

        await userEvent.keyboard("{Escape}");
        expect(screen.queryByRole("menu")).toBeNull();
    });

    it("signs out from a protected page to the home page, not the login page", async () => {
        fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
        renderWithProviders(
            <Routes>
                <Route path={ROUTES.home} element={<p>home page</p>} />
                <Route element={<RequireUser />}>
                    <Route path={ROUTES.library} element={<p>library</p>} />
                </Route>
                <Route path={ROUTES.login} element={<p>login page</p>} />
            </Routes>,
            ROUTES.library,
            sessionTestOptions(TEST_USER),
        );
        await userEvent.click(screen.getByRole("button", { name: "Меню профиля neo" }));
        await userEvent.click(screen.getByRole("menuitem", { name: "Выйти" }));
        expect(await screen.findByText("home page")).toBeInTheDocument();
        expect(screen.queryByText("login page")).toBeNull();
    });

    it("signs out: ends the server session, clears the user and goes home", async () => {
        fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
        const { queryClient } = renderMenu(TEST_USER);

        await userEvent.click(screen.getByRole("button", { name: "Меню профиля neo" }));
        await userEvent.click(screen.getByRole("menuitem", { name: "Выйти" }));

        expect(String(fetchMock.mock.calls[0]?.[0])).toBe("/api/auth/logout");
        expect(await screen.findByText("home page")).toBeInTheDocument();
        expect(screen.getByText("Вы вышли из аккаунта.")).toBeInTheDocument();
        expect(queryClient.getQueryData(sessionKeys.me())).toBeNull();
        expect(screen.getByRole("link", { name: "Войти" })).toBeInTheDocument();
    });
});
