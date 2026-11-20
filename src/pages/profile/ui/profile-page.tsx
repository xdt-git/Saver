import { useTranslation } from "react-i18next";
import { MdPersonOff } from "react-icons/md";
import { useParams } from "react-router-dom";
import { ActivityFeed } from "@/widgets/activity-feed";
import { ProfileHeader } from "@/widgets/profile";
import { EditProfileButton } from "@/features/edit-profile";
import { FollowButton } from "@/features/follow-user";
import { useSession } from "@/entities/session";
import { useProfile } from "@/entities/user";
import { isApiError } from "@/shared/api";
import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { ContentPage } from "@/shared/ui/content-page";
import { EmptyState, ErrorState } from "@/shared/ui/empty-state";
import { PageLoader } from "@/shared/ui/loader";
import styles from "./profile-page.module.scss";

/** A user's public profile and activity. On their own profile the user can edit it. */
export const ProfilePage = () => {
    const { t } = useTranslation();
    const id = Number(useParams().id);
    const { user } = useSession();
    const profile = useProfile(id);
    const isOwn = user?.id === id;

    if (profile.isPending) return <PageLoader />;
    if (profile.isError) {
        const missing =
            isApiError(profile.error) &&
            ["NOT_FOUND", "VALIDATION_ERROR"].includes(profile.error.code);
        return (
            <ContentPage>
                {missing ? (
                    <EmptyState icon={<MdPersonOff />} title={t("profile.notFound")} />
                ) : (
                    <ErrorState onRetry={() => void profile.refetch()} />
                )}
            </ContentPage>
        );
    }

    return (
        <ContentPage>
            <ProfileHeader
                profile={profile.data}
                actions={
                    isOwn ? (
                        <EditProfileButton profile={profile.data} />
                    ) : (
                        <FollowButton profile={profile.data} />
                    )
                }
            />
            <section className={styles.activity}>
                <h2 className={styles.subtitle}>{t("profile.activity")}</h2>
                <ActivityFeed
                    source={{ kind: "user", userId: id }}
                    empty={{
                        title: t("profile.noActivity"),
                        action: isOwn && (
                            <Button to={ROUTES.discover} size="md">
                                {t("collection.toCatalog")}
                            </Button>
                        ),
                    }}
                />
            </section>
        </ContentPage>
    );
};
