import { useTranslation } from "react-i18next";
import { ActivityFeed } from "@/widgets/activity-feed";
import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { ContentPage } from "@/shared/ui/content-page";

/** What the people the user follows have been watching and rating (public profiles only). */
export const FeedPage = () => {
    const { t } = useTranslation();
    return (
        <ContentPage title={t("feed.title")}>
            <ActivityFeed
                source={{ kind: "feed" }}
                empty={{
                    title: t("feed.emptyTitle"),
                    description: t("feed.emptyText"),
                    action: (
                        <Button to={ROUTES.discover} size="md">
                            {t("collection.toCatalog")}
                        </Button>
                    ),
                }}
            />
        </ContentPage>
    );
};
