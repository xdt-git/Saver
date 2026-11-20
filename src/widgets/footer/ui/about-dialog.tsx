import { useTranslation } from "react-i18next";
import { Modal } from "@/shared/ui/modal";
import { Text } from "@/shared/ui/text";
import styles from "./footer.module.scss";

interface DialogProps {
    open: boolean;
    onClose: () => void;
}

/** "About the project" dialog: story of the project and its products. */
export const AboutDialog = ({ open, onClose }: DialogProps) => {
    const { t } = useTranslation();

    return (
        <Modal open={open} onClose={onClose} title={t("about.title")}>
            <p className={styles.paragraph}>{t("about.text")}</p>
            <Text as="h3" glow className={styles.subtitle}>
                {t("about.productsTitle")}
            </Text>
            <p className={styles.paragraph}>{t("about.productsText")}</p>
            <Text as="h3" glow className={styles.subtitle}>
                {t("about.dataTitle")}
            </Text>
            <p className={styles.paragraph}>
                {t("about.dataText")}{" "}
                <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">
                    themoviedb.org
                </a>
            </p>
        </Modal>
    );
};
