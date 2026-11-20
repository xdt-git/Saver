import { useTranslation } from "react-i18next";
import { MdSearchOff } from "react-icons/md";
import { useParams } from "react-router-dom";
import { CardActions } from "@/widgets/catalog";
import { ContentPoster, RatingBadges, useContent, useContentLabels } from "@/entities/content";
import { isApiError } from "@/shared/api";
import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { ContentPage } from "@/shared/ui/content-page";
import { EmptyState, ErrorState } from "@/shared/ui/empty-state";
import { PageLoader } from "@/shared/ui/loader";
import { Text } from "@/shared/ui/text";
import styles from "./content-details-page.module.scss";

/** Everything about one item, with the same status and rating controls as the cards. */
export const ContentDetailsPage = () => {
    const { t } = useTranslation();
    const labels = useContentLabels();
    const id = Number(useParams().id);
    const { data: item, isPending, isError, error, refetch } = useContent(id);

    const back = (
        <Button to={ROUTES.discover} variant="secondary" className={styles.back}>
            {t("content.back")}
        </Button>
    );

    if (isPending) return <PageLoader />;
    if (isError) {
        const missing = isApiError(error) && ["NOT_FOUND", "VALIDATION_ERROR"].includes(error.code);
        return (
            <ContentPage>
                {missing ? (
                    <EmptyState
                        icon={<MdSearchOff />}
                        title={t("content.notFound")}
                        description={t("content.notFoundText")}
                        action={back}
                    />
                ) : (
                    <ErrorState onRetry={() => void refetch()} />
                )}
            </ContentPage>
        );
    }

    const facts = [labels.type(item.type), item.releaseYear, labels.duration(item)].filter(Boolean);

    return (
        <ContentPage>
            {back}
            <article className={styles.details}>
                <ContentPoster item={item} className={styles.poster} />
                <div className={styles.info}>
                    <Text as="h1" glow className={styles.title}>
                        {item.title}
                    </Text>
                    {item.titleEn && item.titleEn !== item.originalTitle && (
                        <p className={styles.original}>{item.titleEn}</p>
                    )}
                    {item.originalTitle && (
                        <p className={styles.original}>
                            {t("content.originalTitle")}: {item.originalTitle}
                        </p>
                    )}
                    <p className={styles.facts}>{facts.join(" · ")}</p>
                    {item.genres.length > 0 && (
                        <p className={styles.facts}>
                            {t("content.genres")}: {item.genres.map(labels.genre).join(", ")}
                        </p>
                    )}
                    <RatingBadges item={item} withLinks />
                    <section className={styles.actions} aria-label={t("content.yourActions")}>
                        <CardActions item={item} />
                    </section>
                    {item.description && (
                        <section>
                            <h2 className={styles.subtitle}>{t("content.description")}</h2>
                            {item.description.split(/\n+/).map((paragraph, index) => (
                                <p key={index} className={styles.description}>
                                    {paragraph}
                                </p>
                            ))}
                        </section>
                    )}
                </div>
            </article>
        </ContentPage>
    );
};
