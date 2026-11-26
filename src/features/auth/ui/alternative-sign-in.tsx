import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { sessionApi, sessionKeys } from "@/entities/session";
import styles from "./auth-card.module.scss";
import { GoogleSignIn } from "./google-sign-in";
import { TelegramSignIn } from "./telegram-sign-in";

interface AlternativeSignInProps {
    /** The sign-up checkbox; a new Google account keeps the answer. */
    notificationsConsent?: boolean;
}

/** "or" and the buttons of the sign-in methods the API has turned on (Google, Telegram). */
export const AlternativeSignIn = ({ notificationsConsent }: AlternativeSignInProps) => {
    const { t } = useTranslation();
    const { data: providers } = useQuery({
        queryKey: sessionKeys.providers(),
        queryFn: ({ signal }) => sessionApi.providers(signal),
        staleTime: Infinity,
    });
    const google = providers?.google ?? null;
    const telegram = providers?.telegram ?? null;
    if (!google && !telegram) return null;

    return (
        <div className={styles.alternative}>
            <span className={styles.divider}>{t("auth.or")}</span>
            {google && (
                <GoogleSignIn clientId={google} notificationsConsent={notificationsConsent} />
            )}
            {telegram && <TelegramSignIn bot={telegram} />}
        </div>
    );
};
