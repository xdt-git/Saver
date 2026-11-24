import { useState } from "react";
import { useTranslation } from "react-i18next";
import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";
import { ContentCard, ContentCardSkeleton, useRandomContent } from "@/entities/content";
import { isApiError } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { EmptyState, ErrorState } from "@/shared/ui/empty-state";
import { Modal } from "@/shared/ui/modal";
import { SegmentedControl } from "@/shared/ui/segmented-control";
import type { ContentType } from "@/shared/config/content";
import { useContentLabels } from "@/entities/content";
import { RANDOM_CATEGORIES, toContentFilters, type CatalogFilters } from "../model/filters";
import { CardActions } from "./card-actions";
import styles from "./catalog.module.scss";

const ANY = "any";
type RandomCategory = (typeof RANDOM_CATEGORIES)[number] | typeof ANY;

const isRandomCategory = (
    type: ContentType | undefined,
): type is (typeof RANDOM_CATEGORIES)[number] =>
    RANDOM_CATEGORIES.some((category) => category === type);

/**
 * "Random pick" button: one random item matching the current filters, real data only.
 * The dialog lets the user pick the category (films, series, anime, doramas or any).
 */
export const RandomPick = ({ filters }: { filters: CatalogFilters }) => {
    const { t } = useTranslation();
    const labels = useContentLabels();
    const [open, setOpen] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const [category, setCategory] = useState<RandomCategory>(ANY);
    const { data, isFetching, isError, error, refetch } = useRandomContent(
        { ...toContentFilters(filters), type: category === ANY ? undefined : category },
        attempt,
        open,
    );

    const openPick = () => {
        // Starts from the category the catalog is filtered by.
        setCategory(isRandomCategory(filters.type) ? filters.type : ANY);
        setOpen(true);
    };
    const nothingMatches = isError && isApiError(error) && error.code === "NOT_FOUND";

    const body = () => {
        if (isFetching && !data) return <ContentCardSkeleton />;
        if (nothingMatches) return <EmptyState title={t("discover.randomEmpty")} />;
        if (isError) return <ErrorState onRetry={() => void refetch()} />;
        return data && <ContentCard item={data} actions={<CardActions item={data} />} />;
    };

    return (
        <>
            <Button size="md" className={styles.randomButton} onClick={openPick}>
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
                <SegmentedControl
                    className={styles.randomCategories}
                    ariaLabel={t("discover.randomCategory")}
                    value={category}
                    onChange={setCategory}
                    options={[
                        { value: ANY, label: t("discover.all") },
                        ...RANDOM_CATEGORIES.map((type) => ({
                            value: type,
                            label: labels.type(type),
                        })),
                    ]}
                />
                {body()}
            </Modal>
        </>
    );
};
