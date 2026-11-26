import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { sessionApi, sessionKeys, useSession } from "@/entities/session";
import { telegramApi } from "@/features/notification-settings";
import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { ContentPage } from "@/shared/ui/content-page";
import styles from "./telegram-link-page.module.scss";

/**
 * Opened from the bot's "Link account" button (?code=...). The signed-in user confirms,
 * and the bot's lists join this account (for a title in both, the later one wins).
 */
export const TelegramLinkPage = () => {
    const { t } = useTranslation();
    const [params] = useSearchParams();
    const code = params.get("code") ?? "";
    const { user, signIn } = useSession();
    const { data: providers } = useQuery({
        queryKey: sessionKeys.providers(),
        queryFn: ({ signal }) => sessionApi.providers(signal),
        staleTime: Infinity,
    });
    const link = useMutation({
        mutationFn: () => telegramApi.link(code),
        onSuccess: signIn,
    });
    const bot = providers?.telegram ?? null;

    let text: string;
    let action = null;
    if (!code || link.isError) {
        text = t("telegram.linkInvalid");
    } else if (link.isSuccess) {
        text = t("telegram.linkDone");
        action = bot && (
            <a className={styles.link} href={`https://t.me/${bot}`}>
                {t("telegram.backToBot")}
            </a>
        );
    } else {
        text = t("telegram.linkConfirm", { username: user?.username ?? "" });
        action = (
            <Button size="md" disabled={link.isPending} onClick={() => link.mutate()}>
                {t("telegram.linkButton")}
            </Button>
        );
    }

    return (
        <ContentPage title={t("telegram.linkTitle")} narrow>
            <div className={styles.card}>
                <p className={styles.text}>{text}</p>
                <div className={styles.actions}>
                    {action}
                    <Button size="md" variant="secondary" to={ROUTES.collection}>
                        {t("telegram.toCollection")}
                    </Button>
                </div>
            </div>
        </ContentPage>
    );
};
