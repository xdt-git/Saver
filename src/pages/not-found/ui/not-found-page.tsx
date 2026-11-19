import { utilities } from "@/shared/styles";
import styles from "./not-found-page.module.scss";

export const NotFoundPage = () => {
    return (
        <main className={styles.main}>
            <h1 className={utilities.glowText}>Not Found Page</h1>
        </main>
    );
};
