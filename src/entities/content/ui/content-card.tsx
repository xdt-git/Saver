import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { contentPath } from "@/shared/config/routes";
import { cn } from "@/shared/lib";
import { Skeleton } from "@/shared/ui/skeleton";
import { useContentLabels } from "../lib/labels";
import type { ContentItem } from "../model/types";
import styles from "./content-card.module.scss";
import { ContentPoster } from "./content-poster";

interface ContentCardProps {
    item: ContentItem;
    /** Extra lines under the description (e.g. the user's notes in the library). */
    extra?: ReactNode;
    /** Controls under the info (status, rating); supplied by features. */
    actions?: ReactNode;
    className?: string;
}

/** Catalog card: poster, title (link to details), type, year, genres, rating, description. */
export const ContentCard = ({ item, extra, actions, className }: ContentCardProps) => {
    const labels = useContentLabels();
    const meta = [labels.type(item.type), item.releaseYear, labels.duration(item)].filter(Boolean);

    return (
        <article className={cn(styles.card, className)} aria-labelledby={`content-${item.id}`}>
            <Link to={contentPath(item.id)} className={styles.posterLink} tabIndex={-1}>
                <ContentPoster item={item} />
            </Link>
            <div className={styles.body}>
                <h3 id={`content-${item.id}`} className={styles.title}>
                    <Link to={contentPath(item.id)}>{item.title}</Link>
                </h3>
                <p className={styles.meta}>{meta.join(" · ")}</p>
                {item.genres.length > 0 && (
                    <ul className={styles.genres} aria-label={labels.genresLabel}>
                        {item.genres.map((genre) => (
                            <li key={genre.slug} className={styles.genre}>
                                {labels.genre(genre)}
                            </li>
                        ))}
                    </ul>
                )}
                <p className={styles.rating}>{labels.rating(item.rating)}</p>
                {item.description && <p className={styles.description}>{item.description}</p>}
                {extra}
                {actions && <div className={styles.actions}>{actions}</div>}
            </div>
        </article>
    );
};

/** Placeholder with the card's shape while a page loads. */
export const ContentCardSkeleton = () => (
    <div className={styles.card} aria-hidden="true">
        <Skeleton variant="image" className={styles.posterSkeleton} />
        <div className={styles.body}>
            <Skeleton variant="title" />
            <Skeleton count={3} />
        </div>
    </div>
);
