import { useTranslation } from "react-i18next";
import subtitle from "@/shared/assets/subtitle.webp";
import styles from "./library-banner.module.scss";

export const LibraryBanner = () => {
    const { t } = useTranslation();

    return (
        <div>
            <img alt={t("library.bannerAlt")} src={subtitle} className={styles.subtitle} />
        </div>
    );
};
