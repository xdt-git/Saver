import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { sessionKeys, sessionTestOptions, TEST_USER } from "@/entities/session";
import { renderWithProviders } from "@/shared/config/tests";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });

const fetchMock = vi.fn<typeof fetch>();
const sentBody = (index = 0) => JSON.parse(String(fetchMock.mock.calls[index]?.[1]?.body));

beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

const renderForm = (ui: JSX.Element) => renderWithProviders(ui, "/", sessionTestOptions(null));

describe("LoginForm", () => {
    it("checks required fields before sending anything", async () => {
        renderForm(<LoginForm />);
        await userEvent.click(screen.getByRole("button", { name: "Войти" }));

        expect(screen.getAllByText("Обязательное поле")).toHaveLength(2);
        expect(screen.getByLabelText("Email или имя пользователя")).toHaveAttribute(
            "aria-invalid",
            "true",
        );
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("signs in and stores the user in the session", async () => {
        fetchMock.mockResolvedValueOnce(json(200, { success: true, data: TEST_USER }));
        const { queryClient } = renderForm(<LoginForm />);

        await userEvent.type(screen.getByLabelText("Email или имя пользователя"), "neo");
        await userEvent.type(screen.getByLabelText("Пароль"), "Follow1Rabbit");
        await userEvent.click(screen.getByRole("button", { name: "Войти" }));

        expect(sentBody()).toEqual({ login: "neo", password: "Follow1Rabbit" });
        await vi.waitFor(() =>
            expect(queryClient.getQueryData(sessionKeys.me())).toEqual(TEST_USER),
        );
    });

    it("shows one message for wrong credentials", async () => {
        fetchMock.mockResolvedValueOnce(
            json(401, { success: false, message: "Invalid", error: { code: "UNAUTHORIZED" } }),
        );
        renderForm(<LoginForm />);

        await userEvent.type(screen.getByLabelText("Email или имя пользователя"), "neo");
        await userEvent.type(screen.getByLabelText("Пароль"), "wrong");
        await userEvent.click(screen.getByRole("button", { name: "Войти" }));

        expect(await screen.findByRole("alert")).toHaveTextContent("Неверный логин или пароль.");
        // Wrong credentials must not trigger a session refresh.
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("explains too many attempts", async () => {
        fetchMock.mockResolvedValueOnce(
            json(429, { success: false, error: { code: "TOO_MANY_REQUESTS" } }),
        );
        renderForm(<LoginForm />);
        await userEvent.type(screen.getByLabelText("Email или имя пользователя"), "neo");
        await userEvent.type(screen.getByLabelText("Пароль"), "x");
        await userEvent.click(screen.getByRole("button", { name: "Войти" }));
        expect(await screen.findByRole("alert")).toHaveTextContent("Слишком много попыток");
    });
});

describe("RegisterForm", () => {
    const fill = async (overrides: Partial<Record<string, string>> = {}) => {
        const values = {
            Email: "Neo@Matrix.io",
            "Имя пользователя": "Neo",
            Пароль: "Follow1Rabbit",
            "Повторите пароль": "Follow1Rabbit",
            ...overrides,
        };
        for (const [label, value] of Object.entries(values)) {
            if (value) await userEvent.type(screen.getByLabelText(label), value);
        }
        await userEvent.click(screen.getByRole("button", { name: "Создать аккаунт" }));
    };

    it("validates every field on the client and re-checks while typing", async () => {
        renderForm(<RegisterForm />);
        await fill({ "Повторите пароль": "Other1Rabbit", Пароль: "weak" });

        expect(screen.getByText("Не меньше 8 символов")).toBeInTheDocument();
        expect(screen.getByText("Пароли не совпадают")).toBeInTheDocument();
        expect(fetchMock).not.toHaveBeenCalled();

        await userEvent.clear(screen.getByLabelText("Пароль"));
        await userEvent.type(screen.getByLabelText("Пароль"), "Other1Rabbit");
        expect(screen.queryByText("Не меньше 8 символов")).toBeNull();
        expect(screen.queryByText("Пароли не совпадают")).toBeNull();
    });

    it("sends normalized data and signs the new user in", async () => {
        fetchMock.mockResolvedValueOnce(json(201, { success: true, data: TEST_USER }));
        const { queryClient } = renderForm(<RegisterForm />);
        await fill();

        expect(sentBody()).toEqual({
            email: "neo@matrix.io",
            username: "neo",
            password: "Follow1Rabbit",
            confirmPassword: "Follow1Rabbit",
            language: "ru",
        });
        await vi.waitFor(() =>
            expect(queryClient.getQueryData(sessionKeys.me())).toEqual(TEST_USER),
        );
    });

    it("shows taken email and username next to their fields", async () => {
        fetchMock.mockResolvedValueOnce(
            json(409, {
                success: false,
                message: "Email or username is already taken",
                error: {
                    code: "CONFLICT",
                    fields: {
                        email: "Email is already taken",
                        username: "Username is already taken",
                    },
                },
            }),
        );
        renderForm(<RegisterForm />);
        await fill();

        expect(await screen.findByText("Этот email уже занят")).toBeInTheDocument();
        expect(screen.getByText("Это имя уже занято")).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
    });
});

describe("Signing in refreshes data loaded as a guest", () => {
    it("refetches other cached queries for the new user", async () => {
        fetchMock.mockResolvedValueOnce(json(200, { success: true, data: TEST_USER }));
        const { queryClient } = renderForm(<LoginForm />);
        queryClient.setQueryData(["users", "profile", 2], { isFollowing: null });

        await userEvent.type(screen.getByLabelText("Email или имя пользователя"), "neo");
        await userEvent.type(screen.getByLabelText("Пароль"), "Follow1Rabbit");
        await userEvent.click(screen.getByRole("button", { name: "Войти" }));

        await vi.waitFor(() =>
            expect(queryClient.getQueryState(["users", "profile", 2])?.isInvalidated).toBe(true),
        );
    });
});
