import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { sessionTestOptions, TEST_USER } from "@/entities/session";
import { ROUTES } from "@/shared/config/routes";
import { renderWithProviders } from "@/shared/config/tests";
import { Layout } from "./layout";

const asGuest = sessionTestOptions(null);
const asUser = sessionTestOptions(TEST_USER);

// Pages are lazy chunks, so they are awaited with findBy*.
describe("App routing", () => {
    it("shows a loader, then the landing page at /", async () => {
        renderWithProviders(<Layout />, ROUTES.home, asGuest);
        expect(screen.getByRole("status", { name: "Загрузка" })).toBeInTheDocument();
        expect(await screen.findByRole("heading", { name: /NightReel/ })).toBeInTheDocument();
        expect(screen.queryByRole("status", { name: "Загрузка" })).toBeNull();
    });

    it("links the Start button to the library (collection) page", async () => {
        renderWithProviders(<Layout />, ROUTES.home, asGuest);
        const startLink = await screen.findByRole("link", { name: "Начать" });
        expect(startLink).toHaveAttribute("href", ROUTES.collection);
        // A link must not wrap a <button>: nested interactive elements are invalid HTML.
        expect(startLink.querySelector("button")).toBeNull();
    });

    it("sends the old /Save address to the library (collection)", async () => {
        renderWithProviders(<Layout />, ROUTES.legacyLibrary, asUser);
        expect(await screen.findByRole("heading", { name: "Моя библиотека" })).toBeInTheDocument();
    });

    it.each(["/some/unknown/path", "/content/1/extra"])(
        "shows the 404 page at %s",
        async (path) => {
            renderWithProviders(<Layout />, path, asGuest);
            expect(
                await screen.findByRole("heading", { name: "Страница не найдена" }),
            ).toBeInTheDocument();
        },
    );

    it("renders the header on every page, even while a page is loading", () => {
        renderWithProviders(<Layout />, "/some/unknown/path", asGuest);
        expect(screen.getByRole("navigation")).toBeInTheDocument();
    });
});

describe("Protected and guest-only routes", () => {
    it("sends a guest from the library to the login page", async () => {
        renderWithProviders(<Layout />, ROUTES.collection, asGuest);
        expect(await screen.findByRole("heading", { name: "Вход" })).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Моя библиотека" })).toBeNull();
    });

    it.each([ROUTES.login, ROUTES.register])(
        "sends a signed-in user away from %s",
        async (path) => {
            renderWithProviders(<Layout />, path, asUser);
            expect(await screen.findByRole("heading", { name: /NightReel/ })).toBeInTheDocument();
        },
    );

    it("shows the register page to guests, linked from the login page", async () => {
        renderWithProviders(<Layout />, ROUTES.register, asGuest);
        expect(await screen.findByRole("heading", { name: "Регистрация" })).toBeInTheDocument();
        const form = screen.getByRole("heading", { name: "Регистрация" }).closest("form");
        expect(within(form as HTMLElement).getByRole("link", { name: "Войти" })).toHaveAttribute(
            "href",
            ROUTES.login,
        );
    });

    it("brings a guest back to the page they wanted after signing up via the login page", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(
                async () =>
                    new Response(JSON.stringify({ success: true, data: TEST_USER }), {
                        status: 201,
                        headers: { "Content-Type": "application/json" },
                    }),
            ),
        );
        renderWithProviders(<Layout />, ROUTES.collection, asGuest);

        await userEvent.click(await screen.findByRole("link", { name: "Зарегистрироваться" }));
        await userEvent.type(await screen.findByLabelText("Email"), "neo@matrix.io");
        await userEvent.type(screen.getByLabelText("Имя пользователя"), "neo");
        await userEvent.type(screen.getByLabelText("Пароль"), "Follow1Rabbit");
        await userEvent.type(screen.getByLabelText("Повторите пароль"), "Follow1Rabbit");
        await userEvent.click(screen.getByRole("button", { name: "Создать аккаунт" }));

        expect(await screen.findByRole("heading", { name: "Моя библиотека" })).toBeInTheDocument();
        vi.unstubAllGlobals();
    });

    it("waits for the session check instead of redirecting at once", () => {
        // No seeded session: /auth/me is still pending.
        vi.stubGlobal(
            "fetch",
            vi.fn(() => new Promise<Response>(() => {})),
        );
        renderWithProviders(<Layout />, ROUTES.collection, { wrapper: asGuest.wrapper });
        expect(screen.getByRole("status", { name: "Загрузка" })).toBeInTheDocument();
        vi.unstubAllGlobals();
    });
});
