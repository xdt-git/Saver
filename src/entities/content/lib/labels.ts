import { useTranslation } from "react-i18next";
import type { ContentItem, ContentType, Genre } from "../model/types";

/** Translated labels for content fields; genre names fall back to the API's English name. */
export const useContentLabels = () => {
    const { t } = useTranslation();
    return {
        genresLabel: t("content.genres"),
        type: (type: ContentType) => t(`contentTypes.${type}`),
        genre: (genre: Genre) => t(`genres.${genre.slug}`, { defaultValue: genre.name }),
        /** Real duration only: "155 min" or "26 × 55 min"; null when unknown. */
        duration: (
            item: Pick<ContentItem, "runtimeMinutes" | "episodeCount" | "episodeRuntimeMinutes">,
        ) => {
            if (item.episodeCount && item.episodeRuntimeMinutes) {
                return t("content.episodes", {
                    episodes: item.episodeCount,
                    minutes: item.episodeRuntimeMinutes,
                });
            }
            return item.runtimeMinutes
                ? t("content.minutes", { value: item.runtimeMinutes })
                : null;
        },
        rating: ({ average, count }: ContentItem["rating"]) =>
            average === null
                ? t("content.noRatings")
                : t("content.ratingValue", { average: average.toFixed(1), votes: count }),
    };
};
