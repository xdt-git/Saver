import { Text } from "@/shared/ui/text";
import styles from "./not-found-page.module.scss";

export const NotFoundPage = () => {
    return (
        <main className={styles.main}>
            <Text as="h1" glow>
                Not Found Page
            </Text>
        </main>
    );
};
