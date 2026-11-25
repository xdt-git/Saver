import { useTranslation } from "react-i18next";
import { useSession } from "@/entities/session";
import { Checkbox } from "@/shared/ui/checkbox";
import { useToast } from "@/shared/ui/toast";
import { useUpdateNotifications } from "../model/use-update-notifications";
import styles from "./notification-settings.module.scss";

const KINDS = [
    { key: "following", field: "notifyFollowing" },
    { key: "likes", field: "notifyLikes" },
    { key: "comments", field: "notifyComments" },
] as const;

/** The consent switch and the kinds of notifications; every change is saved at once. */
export const NotificationSettings = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const { user } = useSession();
    const update = useUpdateNotifications(() => toast.success(t("notifications.saved")));
    if (!user) return null;
    const { notifications } = user;
    const enabled = notifications.consent === true;

    return (
        <fieldset className={styles.settings} disabled={update.isPending}>
            <legend className={styles.title}>{t("notifications.settingsTitle")}</legend>
            <Checkbox
                label={t("notifications.enabled")}
                checked={enabled}
                onChange={(event) => update.mutate({ notificationsConsent: event.target.checked })}
            />
            <div className={styles.kinds}>
                {KINDS.map(({ key, field }) => (
                    <Checkbox
                        key={key}
                        label={t(`notifications.${key}`)}
                        checked={notifications[key]}
                        disabled={!enabled}
                        onChange={(event) => update.mutate({ [field]: event.target.checked })}
                    />
                ))}
            </div>
        </fieldset>
    );
};
