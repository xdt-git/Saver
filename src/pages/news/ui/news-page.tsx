import { useTranslation } from "react-i18next";
import { ActivityFeed } from "@/widgets/activity-feed";
import { PeopleSearch } from "@/widgets/people-search";
import { useSession } from "@/entities/session";
import { oneOfParam, toSearchParams, useUrlState } from "@/shared/lib";
import { Button } from "@/shared/ui/button";
import { ContentPage } from "@/shared/ui/content-page";
import { SegmentedControl } from "@/shared/ui/segmented-control";
import styles from "./news-page.module.scss";

const TABS = ["all", "following"] as const;
type Tab = (typeof TABS)[number];

// Module-level, so the URL state hook gets stable functions.
const parseTab = (params: URLSearchParams) => ({
    tab: oneOfParam(params.get("tab"), TABS) ?? "all",
});
const serializeTab = ({ tab }: { tab: Tab }) =>
    toSearchParams({ tab: tab === "all" ? undefined : tab });

/**
 * News: find people, then see what everyone (public profiles) or the people you follow
 * have been adding, watching and rating. The tab is kept in the URL (?tab=following).
 */
export const NewsPage = () => {
    const { t } = useTranslation();
    const { status } = useSession();
    const [state, setState] = useUrlState(parseTab, serializeTab);
    const signedIn = status === "authenticated";
    // Guests have no subscriptions: they always see everyone.
    const tab: Tab = signedIn ? state.tab : "all";

    return (
        <ContentPage title={t("news.title")} narrow>
            <div className={styles.layout}>
                <PeopleSearch />
                <section className={styles.feed} aria-labelledby="news-feed-title">
                    <div className={styles.feedHeader}>
                        <h2 id="news-feed-title" className={styles.heading}>
                            {t("news.feedTitle")}
                        </h2>
                        {signedIn && (
                            <SegmentedControl
                                ariaLabel={t("news.feedTitle")}
                                value={tab}
                                onChange={(next) => setState({ tab: next })}
                                options={[
                                    { value: "all", label: t("news.tabs.all") },
                                    { value: "following", label: t("news.tabs.following") },
                                ]}
                            />
                        )}
                    </div>
                    {tab === "all" ? (
                        <ActivityFeed
                            key="all"
                            source={{ kind: "all" }}
                            empty={{
                                title: t("news.emptyAllTitle"),
                                description: t("news.emptyAllText"),
                            }}
                        />
                    ) : (
                        <ActivityFeed
                            key="following"
                            source={{ kind: "feed" }}
                            empty={{
                                title: t("feed.emptyTitle"),
                                description: t("news.emptyFollowingText"),
                                action: (
                                    <Button size="md" onClick={() => setState({ tab: "all" })}>
                                        {t("news.tabs.all")}
                                    </Button>
                                ),
                            }}
                        />
                    )}
                </section>
            </div>
        </ContentPage>
    );
};
