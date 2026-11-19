import { cn } from "@/shared/lib";
import styles from "./loader.module.scss";

export type LoaderSize = "sm" | "md" | "lg";

export interface LoaderProps {
    size?: LoaderSize;
    /** Text for screen readers. */
    label?: string;
    className?: string;
}

/** Neon spinner for loading states. */
export const Loader = ({ size = "md", label = "Загрузка", className }: LoaderProps) => (
    <span role="status" aria-label={label} className={cn(styles.loader, styles[size], className)} />
);
