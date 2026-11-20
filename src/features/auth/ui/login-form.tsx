import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { sessionApi, type LoginPayload } from "@/entities/session";
import { ROUTES } from "@/shared/config/routes";
import { useAuthForm } from "../model/use-auth-form";
import { validateLogin } from "../model/validation";
import { AuthCard } from "./auth-card";
import styles from "./auth-card.module.scss";
import { AuthSwitchLink } from "./auth-switch-link";
import { AuthField } from "./auth-field";

const INITIAL: LoginPayload = { login: "", password: "" };

/** Sign in with email or username. On success the session updates and the guard redirects. */
export const LoginForm = () => {
    const { t } = useTranslation();
    const { field, onSubmit, formError, isSubmitting } = useAuthForm({
        initial: INITIAL,
        validate: validateLogin,
        submit: sessionApi.login,
    });

    return (
        <AuthCard
            title={t("auth.login.title")}
            submitLabel={t("auth.login.submit")}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            formError={formError}
            footer={
                <>
                    <p className={styles.footerLine}>
                        <Link to={ROUTES.forgotPassword}>{t("auth.login.forgot")}</Link>
                    </p>
                    <AuthSwitchLink
                        question={t("auth.login.noAccount")}
                        to={ROUTES.register}
                        label={t("auth.register.link")}
                    />
                </>
            }
        >
            <AuthField
                label={t("auth.fields.login")}
                autoComplete="username"
                autoFocus
                {...field("login")}
            />
            <AuthField
                label={t("auth.fields.password")}
                type="password"
                autoComplete="current-password"
                {...field("password")}
            />
        </AuthCard>
    );
};
