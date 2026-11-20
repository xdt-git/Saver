import { cn } from "@/shared/lib";
import styles from "./skeleton.module.scss";

export type SkeletonVariant = "text" | "title" | "avatar" | "image" | "button";

export interface SkeletonProps {
    variant?: SkeletonVariant;
    /** How many skeletons of this variant to render (e.g. several text lines). */
    count?: number;
    /** Custom size or spacing through a class, never inline styles. */
    className?: string;
}

/** Placeholder shown while content is loading. Hidden from screen readers. */
export const Skeleton = ({ variant = "text", count = 1, className }: SkeletonProps) => (
    <>
        {Array.from({ length: count }, (_, index) => (
            <span
                key={index}
                aria-hidden="true"
                data-testid="skeleton"
                className={cn(styles.skeleton, styles[variant], className)}
            />
        ))}
    </>
);
