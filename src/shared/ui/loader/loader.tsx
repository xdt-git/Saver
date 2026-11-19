import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib";
import styles from "./loader.module.scss";

export type LoaderSize = "sm" | "md" | "lg";

export interface LoaderProps {
    size?: LoaderSize;
    /** Text for screen readers. Defaults to the translated "Loading". */
    label?: string;
    className?: string;
}

/** Neon spinner for loading states. */
export const Loader = ({ size = "md", label, className }: LoaderProps) => {
    const { t } = useTranslation();

    return (
        <span
            role="status"
            aria-label={label ?? t("common.loading")}
            className={cn(styles.loader, styles[size], className)}
        />
    );
};
