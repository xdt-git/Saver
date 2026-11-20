import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
    sessionApi,
    useSession,
    type ForgotPasswordPayload,
    type ResetPasswordPayload,
} from "@/entities/session";
import { ROUTES } from "@/shared/config/routes";
import { useAuthForm } from "../model/use-auth-form";
import { PASSWORD_MIN, validateForgot, validateNewPassword } from "../model/validation";
import { AuthCard } from "./auth-card";
import { AuthField } from "./auth-field";
import { AuthNotice } from "./auth-notice";
import styles from "./auth-card.module.scss";

const toLogin = (label: string) => <Link to={ROUTES.login}>{label}</Link>;

/** "Forgot password": asks for the email; the answer is the same whether it exists or not. */
export const ForgotPasswordForm = () => {
    const { t } = useTranslation();
    const { field, onSubmit, formError, isSubmitting, isSuccess } = useAuthForm<
        ForgotPasswordPayload,
        null
    >({
        initial: { email: "" },
        validate: validateForgot,
        submit: sessionApi.forgotPassword,
        onSuccess: () => {},
    });

    if (isSuccess) {
        return (
            <AuthNotice
                title={t("auth.forgot.sentTitle")}
                text={t("auth.forgot.sentText")}
                action={toLogin(t("auth.backToLogin"))}
            />
        );
    }
    return (
        <AuthCard
            title={t("auth.forgot.title")}
            submitLabel={t("auth.forgot.submit")}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            formError={formError}
            footer={toLogin(t("auth.backToLogin"))}
        >
            <p className={styles.notice}>{t("auth.forgot.hint")}</p>
            <AuthField
                label={t("auth.fields.email")}
                type="email"
                autoComplete="email"
                autoFocus
                {...field("email")}
            />
        </AuthCard>
    );
};

/** New password from the emailed link. Every session ends, so the user signs in again. */
export const ResetPasswordForm = ({ token }: { token: string }) => {
    const { t } = useTranslation();
    const { status, signOut } = useSession();
    const { field, onSubmit, formError, isSubmitting, isSuccess } = useAuthForm<
        ResetPasswordPayload,
        null
    >({
        initial: { password: "", confirmPassword: "" },
        validate: validateNewPassword,
        submit: (values) => sessionApi.resetPassword(token, values),
        // The server closed this browser's session too: forget it here as well.
        onSuccess: () => {
            if (status === "authenticated") void signOut();
        },
    });

    if (isSuccess) {
        return (
            <AuthNotice
                title={t("auth.reset.doneTitle")}
                text={t("auth.reset.doneText")}
                action={toLogin(t("auth.login.submit"))}
            />
        );
    }
    return (
        <AuthCard
            title={t("auth.reset.title")}
            submitLabel={t("auth.reset.submit")}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            formError={formError}
            footer={<Link to={ROUTES.forgotPassword}>{t("auth.reset.newLink")}</Link>}
        >
            <AuthField
                label={t("auth.fields.newPassword")}
                hint={t("auth.hints.password", { count: PASSWORD_MIN })}
                type="password"
                autoComplete="new-password"
                autoFocus
                {...field("password")}
            />
            <AuthField
                label={t("auth.fields.confirmPassword")}
                type="password"
                autoComplete="new-password"
                {...field("confirmPassword")}
            />
        </AuthCard>
    );
};
