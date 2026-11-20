import { MdMovieFilter } from "react-icons/md";
import { cn } from "@/shared/lib";
import { posterSrcSet } from "../lib/poster";
import type { ContentItem } from "../model/types";
import styles from "./content-poster.module.scss";

/** How large the poster is drawn: picks the image size the browser downloads. */
export type PosterSize = "thumb" | "card" | "details";

interface ContentPosterProps {
    item: Pick<ContentItem, "title" | "posterUrl">;
    size?: PosterSize;
    className?: string;
}

/** Display widths in CSS pixels (see --size-card-poster, --size-details-poster). */
const SIZES: Record<PosterSize, string> = {
    thumb: "56px",
    card: "(max-width: 640px) 120px, 170px",
    details: "(max-width: 640px) 200px, 320px",
};

/** Poster with the neon edge; a placeholder icon when there is no image. */
export const ContentPoster = ({ item, size = "card", className }: ContentPosterProps) =>
    item.posterUrl ? (
        <img
            src={item.posterUrl}
            srcSet={posterSrcSet(item.posterUrl)}
            sizes={SIZES[size]}
            // The 2:3 frame is known before the image loads: no layout shift.
            width={500}
            height={750}
            alt={item.title}
            loading={size === "details" ? "eager" : "lazy"}
            decoding="async"
            className={cn(styles.poster, className)}
        />
    ) : (
        <div className={cn(styles.poster, styles.placeholder, className)} aria-hidden="true">
            <MdMovieFilter />
        </div>
    );
