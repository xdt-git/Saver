import { useState } from "react";
import { useTranslation } from "react-i18next";
import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";
import { ContentCard, ContentCardSkeleton, useRandomContent } from "@/entities/content";
import { isApiError } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { EmptyState, ErrorState } from "@/shared/ui/empty-state";
import { Modal } from "@/shared/ui/modal";
import { toContentFilters, type CatalogFilters } from "../model/filters";
import { CardActions } from "./card-actions";
import styles from "./catalog.module.scss";

/** "Random pick" button: shows one random item matching the current filters, real data only. */
export const RandomPick = ({ filters }: { filters: CatalogFilters }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const { data, isFetching, isError, error, refetch } = useRandomContent(
        toContentFilters(filters),
        attempt,
        open,
    );
    const nothingMatches = isError && isApiError(error) && error.code === "NOT_FOUND";

    const body = () => {
        if (isFetching && !data) return <ContentCardSkeleton />;
        if (nothingMatches) return <EmptyState title={t("discover.randomEmpty")} />;
        if (isError) return <ErrorState onRetry={() => void refetch()} />;
        return data && <ContentCard item={data} actions={<CardActions item={data} />} />;
    };

    return (
        <>
            <Button size="md" className={styles.randomButton} onClick={() => setOpen(true)}>
                <GiPerspectiveDiceSixFacesRandom aria-hidden="true" /> {t("discover.random")}
            </Button>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title={t("discover.randomTitle")}
                footer={
                    !nothingMatches && (
                        <Button
                            size="md"
                            disabled={isFetching}
                            onClick={() => setAttempt((n) => n + 1)}
                        >
                            {t("discover.another")}
                        </Button>
                    )
                }
            >
                {body()}
            </Modal>
        </>
    );
};
