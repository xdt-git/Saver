import type { ReactNode } from "react";
import { Text } from "../text";
import styles from "./content-page.module.scss";

interface ContentPageProps {
    /** Page heading; omit when the content has its own (details page). */
    title?: string;
    /** Buttons next to the heading. */
    actions?: ReactNode;
    children: ReactNode;
}

/** Centered column with an optional heading row: the frame of the catalog and library pages. */
export const ContentPage = ({ title, actions, children }: ContentPageProps) => (
    <main className={styles.main}>
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
