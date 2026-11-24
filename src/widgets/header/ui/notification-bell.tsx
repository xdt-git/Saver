import { useTranslation } from "react-i18next";
import { MdNotifications } from "react-icons/md";
import { useUnreadNotifications } from "@/entities/activity";
import { useSession } from "@/entities/session";
import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import styles from "./header.module.scss";

/** Max number shown on the badge; more reads "99+". */
const BADGE_MAX = 99;

/** Bell for signed-in users: opens the notifications page, shows how many are unread. */
export const NotificationBell = () => {
    const { t } = useTranslation();
    const { status } = useSession();
    const signedIn = status === "authenticated";
    const { data: unread = 0 } = useUnreadNotifications(signedIn);
    if (!signedIn) return null;

    return (
        <Button
            to={ROUTES.notifications}
            variant="icon"
            className={styles.bell}
            aria-label={
                unread > 0
                    ? t("header.notificationsUnread", { count: unread })
                    : t("header.notifications")
            }
        >
            <MdNotifications className={styles.bellIcon} aria-hidden="true" />
            {unread > 0 && (
                <span className={styles.badge} aria-hidden="true">
                    {unread > BADGE_MAX ? `${BADGE_MAX}+` : unread}
                </span>
            )}
        </Button>
    );
};
