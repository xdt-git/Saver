import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { NotificationList } from "@/widgets/notification-list";
import { NotificationSettings } from "@/features/notification-settings";
import { useMarkAllRead, useUnreadNotifications } from "@/entities/activity";
import { useSession } from "@/entities/session";
import { ContentPage } from "@/shared/ui/content-page";

/**
 * Notification settings and the list. Opening the page marks everything as read: the list
 * still shows what was new until the next visit.
 */
export const NotificationsPage = () => {
    const { t } = useTranslation();
    const { user } = useSession();
    const { data: unread = 0 } = useUnreadNotifications(true);
    const { mutate: markAllRead } = useMarkAllRead();

    useEffect(() => {
        if (unread > 0) markAllRead();
    }, [unread, markAllRead]);

    const enabled = user?.notifications.consent === true;

    return (
        <ContentPage title={t("notifications.title")} narrow>
            <NotificationSettings />
            <NotificationList
                emptyText={enabled ? t("notifications.emptyText") : t("notifications.disabledText")}
            />
        </ContentPage>
    );
};
