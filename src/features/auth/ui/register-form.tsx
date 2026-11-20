import { useTranslation } from "react-i18next";
import { sessionApi, type RegisterPayload } from "@/entities/session";
import { ROUTES } from "@/shared/config/routes";
import { useAuthForm } from "../model/use-auth-form";
import { normalizeRegister, PASSWORD_MIN, validateRegister } from "../model/validation";
import { AuthCard } from "./auth-card";
import { AuthSwitchLink } from "./auth-switch-link";
import { AuthField } from "./auth-field";

const INITIAL: RegisterPayload = { email: "", username: "", password: "", confirmPassword: "" };

const register = (values: RegisterPayload) => sessionApi.register(normalizeRegister(values));

/** Create an account; the user is signed in right after. */
export const RegisterForm = () => {
    const { t } = useTranslation();
    const { field, onSubmit, formError, isSubmitting } = useAuthForm({
        initial: INITIAL,
        validate: validateRegister,
        submit: register,
    });

    return (
        <AuthCard
            title={t("auth.register.title")}
            submitLabel={t("auth.register.submit")}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            formError={formError}
            footer={
                <AuthSwitchLink
                    question={t("auth.register.hasAccount")}
                    to={ROUTES.login}
                    label={t("auth.login.link")}
                />
            }
        >
            <AuthField
                label={t("auth.fields.email")}
                type="email"
                autoComplete="email"
                autoFocus
                {...field("email")}
            />
            <AuthField
                label={t("auth.fields.username")}
                hint={t("auth.hints.username")}
                autoComplete="username"
                {...field("username")}
            />
            <AuthField
                label={t("auth.fields.password")}
                hint={t("auth.hints.password", { count: PASSWORD_MIN })}
                type="password"
                autoComplete="new-password"
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
