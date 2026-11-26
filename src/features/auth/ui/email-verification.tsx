import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { sessionApi, useSession } from "@/entities/session";
import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { PageLoader } from "@/shared/ui/loader";
import { useToast } from "@/shared/ui/toast";
import { AuthNotice } from "./auth-notice";
import styles from "./email-verification.module.scss";

/** "Send again" for a signed-in user whose email is not confirmed yet. */
const useResend = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const { user, signIn } = useSession();
    return useMutation({
        mutationFn: sessionApi.resendVerification,
        onSuccess: ({ alreadyVerified }) => {
            if (alreadyVerified && user) {
                signIn({ ...user, emailVerified: true });
                return;
            }
            toast.success(t("auth.verify.resent", { email: user?.email }));
        },
        onError: (error) => toast.apiError(error),
    });
};

/**
 * Opens the emailed link: confirms once (a query, so a double render does not send the
 * one-time token twice) and updates the signed-in user right away.
 */
export const EmailVerification = ({ token }: { token: string }) => {
    const { t } = useTranslation();
    const { user, signIn } = useSession();
    const resend = useResend();
    const result = useQuery({
        queryKey: ["auth", "verify-email", token],
        queryFn: () => sessionApi.verifyEmail(token),
        enabled: token !== "",
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity,
    });

    useEffect(() => {
        if (result.isSuccess && user && !user.emailVerified)
            signIn({ ...user, emailVerified: true });
    }, [result.isSuccess, user, signIn]);

    if (token && result.isPending) return <PageLoader />;
    if (result.isSuccess) {
        return (
            <AuthNotice
                title={t("auth.verify.doneTitle")}
                text={t("auth.verify.doneText")}
                action={<Link to={ROUTES.discover}>{t("auth.verify.toCatalog")}</Link>}
            />
        );
    }
    return (
        <AuthNotice
            title={t("auth.linkInvalidTitle")}
            text={t("auth.verify.invalidText")}
            action={
                user && !user.emailVerified ? (
                    <Button size="md" disabled={resend.isPending} onClick={() => resend.mutate()}>
                        {t("auth.verify.resend")}
                    </Button>
                ) : (
                    <Link to={ROUTES.discover}>{t("auth.verify.toCatalog")}</Link>
                )
            }
        />
    );
};

/** A strip under the header until the email is confirmed, with "send again". */
export const VerifyEmailBanner = () => {
    const { t } = useTranslation();
    const { user, status } = useSession();
    const resend = useResend();
    // Accounts made in Telegram have no email to confirm.
    if (status !== "authenticated" || !user?.email || user.emailVerified) return null;

    return (
        <div className={styles.banner} role="status">
            <span>{t("auth.verify.banner", { email: user.email })}</span>
            <Button
                size="md"
                variant="secondary"
                disabled={resend.isPending}
                onClick={() => resend.mutate()}
            >
                {t("auth.verify.resend")}
            </Button>
        </div>
    );
};
