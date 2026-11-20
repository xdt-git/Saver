import { MdMovieFilter } from "react-icons/md";
import { cn } from "@/shared/lib";
import type { ContentItem } from "../model/types";
import styles from "./content-poster.module.scss";

interface ContentPosterProps {
    item: Pick<ContentItem, "title" | "posterUrl">;
    className?: string;
}

/** Poster with the neon edge; a placeholder icon when there is no image. */
export const ContentPoster = ({ item, className }: ContentPosterProps) =>
    item.posterUrl ? (
        <img
            src={item.posterUrl}
            alt={item.title}
            loading="lazy"
            decoding="async"
            className={cn(styles.poster, className)}
        />
    ) : (
        <div className={cn(styles.poster, styles.placeholder, className)} aria-hidden="true">
            <MdMovieFilter />
        </div>
    );
