import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib";
import type { ContentItem } from "../model/types";
import styles from "./rating-badges.module.scss";

interface RatingBadgesProps {
    item: Pick<ContentItem, "rating" | "externalRatings">;
    /** Details page: IMDb and Shikimori badges link to the title there. */
    withLinks?: boolean;
    className?: string;
}

interface Badge {
    source: string;
    value: string | null;
    votes: number | null;
    href?: string;
}

const IMDB_TITLE_URL = "https://www.imdb.com/title/";
const SHIKIMORI_ANIME_URL = "https://shikimori.io/animes/";

/**
 * Our users' rating next to the outside ones: IMDb for everything it has, Shikimori for
 * anime, TMDB only when neither of those has a score.
 */
export const RatingBadges = ({ item, withLinks = false, className }: RatingBadgesProps) => {
    const { t, i18n } = useTranslation();
    const compact = new Intl.NumberFormat(i18n.language, { notation: "compact" });
    const { imdb, shikimori, tmdb } = item.externalRatings;
    const score = (value: number | null) => (value === null ? null : value.toFixed(1));

    const badges: Badge[] = [
        { source: "Saver", value: score(item.rating.average), votes: item.rating.count || null },
    ];
    if (imdb?.rating != null) {
        badges.push({
            source: "IMDb",
            value: score(imdb.rating),
            votes: imdb.votes,
            href: `${IMDB_TITLE_URL}${imdb.id}/`,
        });
    }
    if (shikimori?.rating != null) {
        badges.push({
            source: "Shikimori",
            value: shikimori.rating.toFixed(2),
            votes: null,
            href: `${SHIKIMORI_ANIME_URL}${shikimori.id}`,
        });
    }
    if (badges.length === 1 && tmdb) {
        badges.push({ source: "TMDB", value: score(tmdb.rating), votes: tmdb.votes });
    }

    return (
        <ul className={cn(styles.badges, className)} aria-label={t("content.ratings")}>
            {badges.map(({ source, value, votes, href }) => {
                const label =
                    value === null
                        ? t("content.ratingNone", { source })
                        : votes
                          ? t("content.ratingOf", { source, value, votes })
                          : t("content.ratingOfNoVotes", { source, value });
                const body = (
                    <>
                        <span className={styles.source}>{source}</span>
                        <span className={styles.value}>{value === null ? "—" : `★ ${value}`}</span>
                        {votes ? (
                            <span className={styles.votes}>{compact.format(votes)}</span>
                        ) : null}
                    </>
                );
                return (
                    <li key={source} className={styles.badge} title={label}>
                        {withLinks && href ? (
                            <a
                                className={styles.link}
                                href={href}
                                target="_blank"
                                rel="noreferrer noopener"
                            >
                                {body}
                            </a>
                        ) : (
                            <span className={styles.link} role="img" aria-label={label}>
                                {body}
                            </span>
                        )}
                    </li>
                );
            })}
        </ul>
    );
};
