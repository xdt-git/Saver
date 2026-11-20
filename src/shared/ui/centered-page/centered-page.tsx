import type { ReactNode } from "react";
import styles from "./centered-page.module.scss";

/** Page body centered between the header and the footer (forms, 404, short messages). */
export const CenteredPage = ({ children }: { children: ReactNode }) => (
    <main className={styles.main}>{children}</main>
);
