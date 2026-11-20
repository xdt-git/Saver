import type { ReactNode } from "react";
import { Text } from "@/shared/ui/text";
import styles from "./auth-card.module.scss";

interface AuthNoticeProps {
    title: string;
    text: string;
    /** A link or button under the text (to sign in, to send again). */
    action?: ReactNode;
}

/** The auth card's frame for results: "email sent", "password changed", "link expired". */
export const AuthNotice = ({ title, text, action }: AuthNoticeProps) => (
    <section className={styles.card} aria-live="polite">
        <Text as="h1" glow className={styles.title}>
            {title}
        </Text>
        <p className={styles.notice}>{text}</p>
        {action && <div className={styles.footer}>{action}</div>}
    </section>
);
