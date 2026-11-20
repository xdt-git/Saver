import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { sessionKeys, sessionTestOptions, TEST_USER } from "@/entities/session";
import { apiFailure, mockApi, renderWithProviders } from "@/shared/config/tests";
import { EmailVerification, VerifyEmailBanner } from "./email-verification";
import { ForgotPasswordForm, ResetPasswordForm } from "./password-reset-forms";

afterEach(() => vi.unstubAllGlobals());

const TOKEN = "a".repeat(43);
const UNVERIFIED = { ...TEST_USER, emailVerified: false };
const guest = sessionTestOptions(null);

describe("ForgotPasswordForm", () => {
    it("checks the email, sends it in the UI language and shows the same answer", async () => {
        const api = mockApi({
            "POST /api/auth/password/forgot": () => ({ status: 202, body: null }),
        });
        renderWithProviders(<ForgotPasswordForm />, "/", guest);

        await userEvent.click(screen.getByRole("button", { name: "Отправить ссылку" }));
        expect(screen.getByText("Обязательное поле")).toBeInTheDocument();

        await userEvent.type(screen.getByLabelText("Email"), " NEO@Matrix.io ");
        await userEvent.click(screen.getByRole("button", { name: "Отправить ссылку" }));

        expect(await screen.findByRole("heading", { name: "Проверьте почту" })).toBeVisible();
        expect(api.calls("POST /api/auth/password/forgot")[0]?.body).toEqual({
            email: "neo@matrix.io",
            language: "ru",
        });
        expect(screen.getByRole("link", { name: "Вернуться ко входу" })).toHaveAttribute(
            "href",
            "/login",
        );
    });
});

describe("ResetPasswordForm", () => {
    it("saves the new password with the token from the link", async () => {
        const api = mockApi({ "POST /api/auth/password/reset": () => ({ body: null }) });
        renderWithProviders(<ResetPasswordForm token={TOKEN} />, "/", guest);

        await userEvent.type(screen.getByLabelText("Новый пароль"), "White2Rabbit");
        await userEvent.type(screen.getByLabelText("Повторите пароль"), "White2Rabbi");
        await userEvent.click(screen.getByRole("button", { name: "Сохранить пароль" }));
        expect(screen.getByText("Пароли не совпадают")).toBeInTheDocument();
        expect(api.calls("POST /api/auth/password/reset")).toHaveLength(0);

        await userEvent.type(screen.getByLabelText("Повторите пароль"), "t");
        await userEvent.click(screen.getByRole("button", { name: "Сохранить пароль" }));

        expect(await screen.findByRole("heading", { name: "Пароль изменён" })).toBeVisible();
        expect(api.calls("POST /api/auth/password/reset")[0]?.body).toEqual({
            token: TOKEN,
            password: "White2Rabbit",
            confirmPassword: "White2Rabbit",
        });
    });

    it("explains a used or expired link", async () => {
        mockApi({ "POST /api/auth/password/reset": () => apiFailure(400, "BAD_REQUEST") });
        renderWithProviders(<ResetPasswordForm token={TOKEN} />, "/", guest);

        await userEvent.type(screen.getByLabelText("Новый пароль"), "White2Rabbit");
        await userEvent.type(screen.getByLabelText("Повторите пароль"), "White2Rabbit");
        await userEvent.click(screen.getByRole("button", { name: "Сохранить пароль" }));

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Ссылка недействительна или устарела. Запросите новую.",
        );
        expect(screen.getByRole("link", { name: "Запросить новую ссылку" })).toHaveAttribute(
            "href",
            "/forgot-password",
        );
    });
});

describe("EmailVerification", () => {
    it("confirms once and marks the signed-in user as verified", async () => {
        const api = mockApi({ "POST /api/auth/email/verify": () => ({ body: null }) });
        const { queryClient } = renderWithProviders(
            <EmailVerification token={TOKEN} />,
            "/",
            sessionTestOptions(UNVERIFIED),
        );

        expect(await screen.findByRole("heading", { name: "Почта подтверждена" })).toBeVisible();
        expect(api.calls("POST /api/auth/email/verify")).toHaveLength(1);
        expect(api.calls("POST /api/auth/email/verify")[0]?.body).toEqual({ token: TOKEN });
        await vi.waitFor(() =>
            expect(queryClient.getQueryData(sessionKeys.me())).toMatchObject({
                emailVerified: true,
            }),
        );
    });

    it("offers a new email when the link does not work", async () => {
        const api = mockApi({
            "POST /api/auth/email/verify": () => apiFailure(400, "BAD_REQUEST"),
            "POST /api/auth/email/resend": () => ({
                status: 202,
                body: { alreadyVerified: false },
            }),
        });
        renderWithProviders(
            <EmailVerification token={TOKEN} />,
            "/",
            sessionTestOptions(UNVERIFIED),
        );

        expect(await screen.findByRole("heading", { name: "Ссылка не сработала" })).toBeVisible();
        await userEvent.click(screen.getByRole("button", { name: "Отправить ещё раз" }));
        expect(await screen.findByText("Письмо отправлено на neo@matrix.io")).toBeVisible();
        expect(api.calls("POST /api/auth/email/resend")[0]?.body).toEqual({ language: "ru" });
    });

    it("needs a token in the link", () => {
        const api = mockApi({});
        renderWithProviders(<EmailVerification token="" />, "/", guest);
        expect(screen.getByRole("heading", { name: "Ссылка не сработала" })).toBeVisible();
        expect(api.fetchMock).not.toHaveBeenCalled();
    });
});

describe("VerifyEmailBanner", () => {
    const renderBanner = (user: typeof TEST_USER | null) =>
        renderWithProviders(
            <Routes>
                <Route path="/" element={<VerifyEmailBanner />} />
            </Routes>,
            "/",
            sessionTestOptions(user),
        );

    it("shows only for signed-in users with an unconfirmed email", () => {
        renderBanner(UNVERIFIED);
        expect(screen.getByRole("status")).toHaveTextContent(
            "Подтвердите почту: мы отправили письмо на neo@matrix.io.",
        );
    });

    it("is hidden for guests and confirmed users", () => {
        const { unmount } = renderBanner(null);
        expect(screen.queryByRole("status")).toBeNull();
        unmount();
        renderBanner(TEST_USER);
        expect(screen.queryByRole("status")).toBeNull();
    });

    it("hides itself when the server says the email is already confirmed", async () => {
        mockApi({ "POST /api/auth/email/resend": () => ({ body: { alreadyVerified: true } }) });
        renderBanner(UNVERIFIED);
        await userEvent.click(screen.getByRole("button", { name: "Отправить ещё раз" }));
        await vi.waitFor(() => expect(screen.queryByRole("status")).toBeNull());
    });

    it("reports a refused resend", async () => {
        mockApi({ "POST /api/auth/email/resend": () => apiFailure(429, "TOO_MANY_REQUESTS") });
        renderBanner(UNVERIFIED);
        await userEvent.click(screen.getByRole("button", { name: "Отправить ещё раз" }));
        expect(await screen.findAllByRole("alert")).not.toHaveLength(0);
    });
});
