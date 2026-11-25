import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { contentPath } from "@/shared/config/routes";
import { formatDate, formatRelativeTime } from "@/shared/lib";
import type { Activity } from "../api/activity-api";
import { useActivityActionText } from "../lib/action-text";
import styles from "./activity-item.module.scss";

interface ActivityItemProps {
    activity: Activity;
    /** Who did it (a user link from entities/user, supplied by the widget). */
    author: ReactNode;
    /** Poster of the item (from entities/content, supplied by the widget). */
    poster?: ReactNode;
    /** Likes and comments under the event (a feature, supplied by the widget). */
    footer?: ReactNode;
}

/** One event in a feed: author, action, the item it is about and when. */
export const ActivityItem = ({ activity, author, poster, footer }: ActivityItemProps) => {
    const { i18n } = useTranslation();
    const action = useActivityActionText(activity);

    return (
        <article className={styles.item}>
            {poster && activity.content && (
                <Link
                    to={contentPath(activity.content.id)}
                    className={styles.poster}
                    tabIndex={-1}
                    aria-hidden="true"
                >
                    {poster}
                </Link>
            )}
            <div className={styles.body}>
                <div className={styles.head}>
                    {author}
                    <time
                        dateTime={activity.createdAt}
                        title={formatDate(activity.createdAt, i18n.language)}
                        className={styles.time}
                    >
                        {formatRelativeTime(activity.createdAt, i18n.language)}
                    </time>
                </div>
                <p className={styles.text}>
                    {action}
                    {activity.content && (
                        <>
                            {": "}
                            <Link to={contentPath(activity.content.id)} className={styles.content}>
                                {activity.content.title}
                            </Link>
                        </>
                    )}
                </p>
                {footer}
            </div>
        </article>
    );
};
