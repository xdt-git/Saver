import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { MdNotificationsNone } from "react-icons/md";
import { useActivityActionText, useNotifications, type AppNotification } from "@/entities/activity";
import { UserLink } from "@/entities/user";
import { contentPath } from "@/shared/config/routes";
import { cn, formatDate, formatRelativeTime } from "@/shared/lib";
import { Button } from "@/shared/ui/button";
import { EmptyState, ErrorState } from "@/shared/ui/empty-state";
import { Skeleton } from "@/shared/ui/skeleton";
import styles from "./notification-list.module.scss";

/** What happened, in words: the followed user's action, or a like / comment on yours. */
const useNotificationText = (notification: AppNotification) => {
    const { t } = useTranslation();
    const action = useActivityActionText(notification.activity);
    if (notification.type === "like") return t("notifications.liked");
    if (notification.type === "comment") return t("notifications.commented");
    return action;
};

const NotificationItem = ({ notification }: { notification: AppNotification }) => {
    const { t, i18n } = useTranslation();
    const text = useNotificationText(notification);
    const { content } = notification.activity;

    return (
        <article className={cn(styles.item, !notification.read && styles.unread)}>
            <div className={styles.head}>
                <UserLink user={notification.actor} compact />
                {!notification.read && (
                    <span className={styles.badge}>{t("notifications.unread")}</span>
                )}
                <time
                    dateTime={notification.createdAt}
                    title={formatDate(notification.createdAt, i18n.language)}
                    className={styles.time}
                >
                    {formatRelativeTime(notification.createdAt, i18n.language)}
                </time>
            </div>
            <p className={styles.text}>
                {text}
                {content && (
                    <>
                        {": "}
                        <Link to={contentPath(content.id)} className={styles.content}>
                            {content.title}
                        </Link>
                    </>
                )}
            </p>
            {notification.comment && (
                <blockquote className={styles.comment}>{notification.comment.text}</blockquote>
            )}
        </article>
    );
};

/** The user's notifications, newest first, with "show more". */
export const NotificationList = ({ emptyText }: { emptyText: string }) => {
    const { t } = useTranslation();
    const list = useNotifications();

    if (list.isPending) {
        return (
            <div className={styles.list} aria-busy="true">
                <Skeleton variant="title" count={3} className={styles.skeleton} />
            </div>
        );
    }
    if (list.isError) return <ErrorState onRetry={() => void list.refetch()} />;

    const items = list.data.pages.flatMap((page) => page.items);
    if (items.length === 0) {
        return (
            <EmptyState
                icon={<MdNotificationsNone />}
                title={t("notifications.emptyTitle")}
                description={emptyText}
            />
        );
    }

    return (
        <div className={styles.list}>
            {items.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
            ))}
            {list.hasNextPage && (
                <Button
                    variant="secondary"
                    className={styles.more}
                    disabled={list.isFetchingNextPage}
                    onClick={() => void list.fetchNextPage()}
                >
                    {t("activity.more")}
                </Button>
            )}
        </div>
    );
};
