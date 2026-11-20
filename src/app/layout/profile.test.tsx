import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Activity } from "@/entities/activity";
import { sessionTestOptions, TEST_USER } from "@/entities/session";
import type { PublicProfile } from "@/entities/user";
import { apiFailure, mockApi, renderWithProviders } from "@/shared/config/tests";
import { Layout } from "./layout";

afterEach(() => vi.unstubAllGlobals());

const profile = (overrides: Partial<PublicProfile> = {}): PublicProfile => ({
    id: 2,
    username: "trinity",
    displayName: "Trinity",
    avatarUrl: null,
    bio: "Follow the white rabbit.",
    isPrivate: false,
    createdAt: "2025-01-15T00:00:00.000Z",
    followersCount: 3,
    followingCount: 1,
    isFollowing: false,
    ...overrides,
});

const event = (id: number, overrides: Partial<Activity> = {}): Activity => ({
    id,
    type: "rated",
    payload: { value: 9 },
    createdAt: new Date().toISOString(),
    user: { id: 2, username: "trinity", displayName: "Trinity", avatarUrl: null },
    content: { id: 1, title: "The Matrix", type: "film", posterUrl: null },
    ...overrides,
});

const asUser = sessionTestOptions(TEST_USER);

describe("Profile page", () => {
    it("shows another user's profile, counters and activity in words", async () => {
        mockApi({
            "GET /api/users/:id": () => ({ body: profile() }),
            "GET /api/users/:id/activity": () => ({
                body: {
                    items: [
                        event(3),
                        event(2, {
                            type: "status_changed",
                            payload: { from: "watching", to: "completed" },
                        }),
                        event(1, { type: "library_added", payload: { status: "planned" } }),
                    ],
                    nextCursor: null,
                },
            }),
        });
        renderWithProviders(<Layout />, "/users/2", asUser);

        expect(await screen.findByRole("heading", { name: "Trinity" })).toBeInTheDocument();
        expect(screen.getByText("Follow the white rabbit.")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "3 подписчики" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Подписаться" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Редактировать профиль" })).toBeNull();

        expect(await screen.findByText(/ставит оценку 9/)).toBeInTheDocument();
        expect(screen.getByText(/завершает просмотр/)).toBeInTheDocument();
        expect(screen.getByText(/добавляет в библиотеку \(В планах\)/)).toBeInTheDocument();
        expect(screen.getAllByRole("link", { name: "The Matrix" })[0]).toHaveAttribute(
            "href",
            "/content/1",
        );
    });

    it("says a private profile's activity is closed instead of failing", async () => {
        mockApi({
            "GET /api/users/:id": () => ({ body: profile({ isPrivate: true }) }),
            "GET /api/users/:id/activity": () => apiFailure(403, "FORBIDDEN"),
        });
        renderWithProviders(<Layout />, "/users/2", asUser);
        expect(await screen.findByText("Профиль закрыт")).toBeInTheDocument();
        expect(screen.getAllByText("Закрытый профиль").length).toBeGreaterThan(0);
    });

    it("says when the user does not exist", async () => {
        mockApi({ "GET /api/users/:id": () => apiFailure(404, "NOT_FOUND") });
        renderWithProviders(<Layout />, "/users/999", asUser);
        expect(await screen.findByText("Такого пользователя нет")).toBeInTheDocument();
    });

    it("loads older events with 'show more'", async () => {
        const api = mockApi({
            "GET /api/users/:id": () => ({ body: profile() }),
            "GET /api/users/:id/activity": ({ url }) =>
                url.searchParams.get("before")
                    ? { body: { items: [event(1, { payload: { value: 5 } })], nextCursor: null } }
                    : { body: { items: [event(2)], nextCursor: 2 } },
        });
        renderWithProviders(<Layout />, "/users/2", asUser);

        await userEvent.click(await screen.findByRole("button", { name: "Показать ещё" }));
        expect(await screen.findByText(/ставит оценку 5/)).toBeInTheDocument();
        expect(api.calls("GET /api/users/:id/activity")[1]?.url.searchParams.get("before")).toBe(
            "2",
        );
        expect(screen.queryByRole("button", { name: "Показать ещё" })).toBeNull();
    });
});

describe("Follows", () => {
    it("follows and unfollows, updating the counter", async () => {
        let followers = 3;
        let following = false;
        const api = mockApi({
            "GET /api/users/:id": () => ({
                body: profile({ followersCount: followers, isFollowing: following }),
            }),
            "GET /api/users/:id/activity": () => ({ body: { items: [], nextCursor: null } }),
            "POST /api/users/:id/follow": () => {
                followers += 1;
                following = true;
                return { status: 201, body: null };
            },
            "DELETE /api/users/:id/follow": () => {
                followers -= 1;
                following = false;
                return { status: 204 };
            },
        });
        renderWithProviders(<Layout />, "/users/2", asUser);

        await userEvent.click(await screen.findByRole("button", { name: "Подписаться" }));
        expect(await screen.findByRole("button", { name: "Отписаться" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "4 подписчики" })).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: "Отписаться" }));
        expect(await screen.findByRole("button", { name: "Подписаться" })).toBeInTheDocument();
        expect(api.calls("DELETE /api/users/:id/follow")).toHaveLength(1);
    });

    it("sends a guest who wants to follow to the login page", async () => {
        mockApi({
            "GET /api/users/:id": () => ({ body: profile({ isFollowing: null }) }),
            "GET /api/users/:id/activity": () => ({ body: { items: [], nextCursor: null } }),
        });
        renderWithProviders(<Layout />, "/users/2", sessionTestOptions(null));
        await userEvent.click(await screen.findByRole("button", { name: "Подписаться" }));
        expect(await screen.findByRole("heading", { name: "Вход" })).toBeInTheDocument();
    });

    it("lists followers and following in a dialog", async () => {
        const api = mockApi({
            "GET /api/users/:id": () => ({ body: profile() }),
            "GET /api/users/:id/activity": () => ({ body: { items: [], nextCursor: null } }),
            "GET /api/users/:id/followers": () => ({
                body: {
                    items: [{ id: 5, username: "morpheus", displayName: null, avatarUrl: null }],
                    page: 1,
                    pageSize: 20,
                    total: 1,
                    totalPages: 1,
                },
            }),
            "GET /api/users/:id/following": () => ({
                body: { items: [], page: 1, pageSize: 20, total: 0, totalPages: 0 },
            }),
        });
        renderWithProviders(<Layout />, "/users/2", asUser);

        await userEvent.click(await screen.findByRole("button", { name: "3 подписчики" }));
        const dialog = screen.getByRole("dialog", { name: "Подписчики и подписки" });
        expect(await within(dialog).findByRole("link", { name: /morpheus/ })).toHaveAttribute(
            "href",
            "/users/5",
        );
        await userEvent.click(within(dialog).getByRole("button", { name: "подписки" }));
        expect(
            await within(dialog).findByText("Пока ни на кого не подписан(а)"),
        ).toBeInTheDocument();
        expect(api.calls("GET /api/users/:id/following")).toHaveLength(1);
    });
});

describe("Own profile", () => {
    it("edits the profile and updates the session user", async () => {
        const me = profile({
            id: TEST_USER.id,
            username: "neo",
            displayName: null,
            bio: null,
            isFollowing: null,
        });
        const api = mockApi({
            "GET /api/users/:id": () => ({ body: me }),
            "GET /api/users/:id/activity": () => ({ body: { items: [], nextCursor: null } }),
            "PATCH /api/users/me": ({ body }) => ({
                body: { ...TEST_USER, ...(body as object), displayName: "The One", bio: null },
            }),
        });
        renderWithProviders(<Layout />, `/users/${TEST_USER.id}`, asUser);

        expect(await screen.findByRole("heading", { name: "neo" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Подписаться" })).toBeNull();
        await userEvent.click(screen.getByRole("button", { name: "Редактировать профиль" }));

        const dialog = screen.getByRole("dialog", { name: "Редактирование профиля" });
        await userEvent.type(within(dialog).getByLabelText("Аватар"), "nope");
        await userEvent.click(within(dialog).getByRole("button", { name: "Сохранить" }));
        expect(within(dialog).getByText(/Ссылка должна начинаться/)).toBeInTheDocument();
        expect(api.calls("PATCH /api/users/me")).toHaveLength(0);

        await userEvent.clear(within(dialog).getByLabelText("Аватар"));
        await userEvent.type(within(dialog).getByLabelText("Отображаемое имя"), " The One ");
        await userEvent.click(within(dialog).getByLabelText("Закрытый профиль"));
        await userEvent.click(within(dialog).getByRole("button", { name: "Сохранить" }));

        await vi.waitFor(() => expect(api.calls("PATCH /api/users/me")).toHaveLength(1));
        expect(api.calls("PATCH /api/users/me")[0]?.body).toEqual({
            displayName: "The One",
            bio: "",
            avatarUrl: "",
            isPrivate: true,
        });
        expect(await screen.findByRole("heading", { name: "The One" })).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: "Меню профиля neo" }));
        expect(screen.getByRole("menu")).toHaveTextContent("The One");
    });
});

describe("Feed page", () => {
    it("is for signed-in users and explains an empty feed", async () => {
        renderWithProviders(<Layout />, "/feed", sessionTestOptions(null));
        expect(await screen.findByRole("heading", { name: "Вход" })).toBeInTheDocument();
    });

    it("shows events of followed users", async () => {
        mockApi({ "GET /api/feed": () => ({ body: { items: [event(1)], nextCursor: null } }) });
        renderWithProviders(<Layout />, "/feed", asUser);
        expect(await screen.findByRole("heading", { name: "Лента" })).toBeInTheDocument();
        expect(await screen.findByRole("link", { name: /Trinity/ })).toHaveAttribute(
            "href",
            "/users/2",
        );
    });

    it("explains an empty feed", async () => {
        mockApi({ "GET /api/feed": () => ({ body: { items: [], nextCursor: null } }) });
        renderWithProviders(<Layout />, "/feed", asUser);
        expect(await screen.findByText("В ленте пока пусто")).toBeInTheDocument();
    });
});
