import type { ReactNode } from "react";
import { cn } from "@/shared/lib";
import { Text } from "../text";
import styles from "./content-page.module.scss";

interface ContentPageProps {
    /** Page heading; omit when the content has its own (details page). */
    title?: string;
    /** Buttons next to the heading. */
    actions?: ReactNode;
    /** A narrow centered column for reading (feeds). */
    narrow?: boolean;
    children: ReactNode;
}

/** Centered column with an optional heading row: the frame of the catalog and library pages. */
export const ContentPage = ({ title, actions, narrow = false, children }: ContentPageProps) => (
    <main className={cn(styles.main, narrow && styles.narrow)}>
        {title && (
            <div className={styles.header}>
                <Text as="h1" glow className={styles.title}>
                    {title}
                </Text>
                {actions}
            </div>
        )}
        {children}
    </main>
);
