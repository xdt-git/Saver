import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { MdLock, MdTimeline } from "react-icons/md";
import { ActivitySocial } from "@/features/activity-social";
import { ActivityItem, useActivity, type ActivitySource } from "@/entities/activity";
import { ContentPoster } from "@/entities/content";
import { UserLink } from "@/entities/user";
import { isApiError } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { EmptyState, ErrorState } from "@/shared/ui/empty-state";
import { Skeleton } from "@/shared/ui/skeleton";
import styles from "./activity-feed.module.scss";

interface ActivityFeedProps {
    source: ActivitySource;
    /** Shown when there are no events yet. */
    empty: { title: string; description?: string; action?: ReactNode };
}

/** Events newest first with "show more"; private profiles get a clear message, not an error. */
export const ActivityFeed = ({ source, empty }: ActivityFeedProps) => {
    const { t } = useTranslation();
    const feed = useActivity(source);

    if (feed.isPending) {
        return (
            <div className={styles.list} aria-busy="true">
                <Skeleton variant="title" count={3} className={styles.skeleton} />
            </div>
        );
    }
    if (feed.isError) {
        if (isApiError(feed.error) && feed.error.code === "FORBIDDEN") {
            return (
                <EmptyState
                    icon={<MdLock />}
                    title={t("profile.privateTitle")}
                    description={t("profile.privateText")}
                />
            );
        }
        return <ErrorState onRetry={() => void feed.refetch()} />;
    }

    const items = feed.data.pages.flatMap((page) => page.items);
    if (items.length === 0) {
        return (
            <EmptyState
                icon={<MdTimeline />}
                title={empty.title}
                description={empty.description}
                action={empty.action}
            />
        );
    }

    return (
        <div className={styles.list}>
            {items.map((activity) => (
                <ActivityItem
                    key={activity.id}
                    activity={activity}
                    author={<UserLink user={activity.user} compact />}
                    poster={
                        activity.content && <ContentPoster item={activity.content} size="thumb" />
                    }
                    footer={<ActivitySocial activity={activity} />}
                />
            ))}
            {feed.hasNextPage && (
                <Button
                    variant="secondary"
                    className={styles.more}
                    disabled={feed.isFetchingNextPage}
                    onClick={() => void feed.fetchNextPage()}
                >
                    {t("activity.more")}
                </Button>
            )}
        </div>
    );
};
