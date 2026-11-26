import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { sessionApi, sessionKeys, useSession } from "@/entities/session";
import { useUpdateNotifications } from "../model/use-update-notifications";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { useToast } from "@/shared/ui/toast";
import { telegramApi } from "../api/telegram-api";
import styles from "./notification-settings.module.scss";

/**
 * The Telegram bot in settings: connect (opens the bot with a one-time code), the linked
 * account with its notification copies, and unlinking. Hidden while the bot is off.
 */
export const TelegramSettings = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const { user, signIn } = useSession();
    const { data: providers } = useQuery({
        queryKey: sessionKeys.providers(),
        queryFn: ({ signal }) => sessionApi.providers(signal),
        staleTime: Infinity,
    });
    const update = useUpdateNotifications(() => toast.success(t("notifications.saved")));
    const connect = useMutation({
        mutationFn: telegramApi.botLink,
        // Opens Telegram (the app, or its web page) on the bot with the code.
        onSuccess: ({ url }) => window.location.assign(url),
        onError: (error) => toast.apiError(error),
    });
    const unlink = useMutation({
        mutationFn: telegramApi.unlink,
        onSuccess: (updated) => {
            signIn(updated);
            toast.success(t("telegram.unlinked"));
        },
        onError: (error) => toast.apiError(error),
    });

    const bot = providers?.telegram ?? null;
    if (!user || !bot) return null;
    const linked = user.telegram;
    // An account made in Telegram has no other way to sign in, so it stays linked.
    const canUnlink = user.email !== null || user.hasPassword;

    return (
        <fieldset
            className={styles.settings}
            disabled={update.isPending || connect.isPending || unlink.isPending}
        >
            <legend className={styles.title}>{t("telegram.title")}</legend>
            {linked ? (
                <>
                    <p className={styles.text}>
                        {linked.username
                            ? t("telegram.linkedAs", { username: linked.username })
                            : t("telegram.linked")}
                    </p>
                    <Checkbox
                        label={t("telegram.copyNotifications")}
                        checked={user.notifications.telegram}
                        onChange={(event) =>
                            update.mutate({ notifyTelegram: event.target.checked })
                        }
                    />
                    <div className={styles.actions}>
                        <a
                            className={styles.link}
                            href={`https://t.me/${bot}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {t("telegram.openBot")}
                        </a>
                        {canUnlink && (
                            <Button size="md" variant="secondary" onClick={() => unlink.mutate()}>
                                {t("telegram.unlink")}
                            </Button>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <p className={styles.text}>{t("telegram.pitch")}</p>
                    <div className={styles.actions}>
                        <Button size="md" onClick={() => connect.mutate()}>
                            {t("telegram.connect")}
                        </Button>
                    </div>
                </>
            )}
        </fieldset>
    );
};
