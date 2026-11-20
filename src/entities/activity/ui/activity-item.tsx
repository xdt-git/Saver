import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { contentPath } from "@/shared/config/routes";
import { formatDate, formatRelativeTime } from "@/shared/lib";
import type { Activity } from "../api/activity-api";
import styles from "./activity-item.module.scss";

interface ActivityItemProps {
    activity: Activity;
    /** Who did it (a user link from entities/user, supplied by the widget). */
    author: ReactNode;
}

/** What the action was, in words: "adds to the library (Planned)", "rates 9", … */
const useActionText = ({ type, payload }: Activity) => {
    const { t } = useTranslation();
    const status = (value?: string) =>
        value ? t(`library.status.${value}` as "library.status.planned") : "";
    if (type === "rated") return t("activity.rated", { value: payload?.value });
    if (type === "library_added") return t("activity.added", { status: status(payload?.status) });
    if (payload?.to === "completed") return t("activity.completed");
    return t("activity.statusChanged", { from: status(payload?.from), to: status(payload?.to) });
};

/** One event in a feed: author, action, the item it is about and when. */
export const ActivityItem = ({ activity, author }: ActivityItemProps) => {
    const { i18n } = useTranslation();
    const action = useActionText(activity);

    return (
        <article className={styles.item}>
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
        </article>
    );
};
