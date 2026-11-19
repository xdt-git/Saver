import type { ReactNode } from "react";
import { cn } from "@/shared/lib";
import { Text } from "../text";
import styles from "./empty-state.module.scss";

export type EmptyStateTone = "default" | "error";

export interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    /** Optional call to action, e.g. a Button. */
    action?: ReactNode;
    /** "error" colors the icon and title and announces the message to screen readers. */
    tone?: EmptyStateTone;
    className?: string;
}

/** Message for empty lists and failed loads. ErrorState is this component with tone="error". */
export const EmptyState = ({
    title,
    description,
    icon,
    action,
    tone = "default",
    className,
}: EmptyStateProps) => (
    <div
        role={tone === "error" ? "alert" : undefined}
        className={cn(styles.state, tone === "error" && styles.error, className)}
    >
        {icon && (
            <span className={styles.icon} aria-hidden="true">
                {icon}
            </span>
        )}
        <Text as="h3" glow={tone === "default"} className={styles.title}>
            {title}
        </Text>
        {description && <p className={styles.description}>{description}</p>}
        {action && <div className={styles.action}>{action}</div>}
    </div>
);
