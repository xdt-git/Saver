import { useTranslation } from "react-i18next";
import { Text } from "@/shared/ui/text";
import styles from "./not-found-page.module.scss";

export const NotFoundPage = () => {
    const { t } = useTranslation();

    return (
        <main className={styles.main}>
            <Text as="h1" glow>
                {t("notFound.title")}
            </Text>
        </main>
    );
};
