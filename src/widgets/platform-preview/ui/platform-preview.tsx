import { useTranslation } from "react-i18next";
import allWeb from "@/shared/assets/all_web.webp";
import styles from "./platform-preview.module.scss";

// The preview per platform (all_mobile.webp and others) is switched in C6.2.
export const PlatformPreview = () => {
    const { t } = useTranslation();

    return (
        <div>
            <img src={allWeb} alt={t("landing.previewAlt")} className={styles.preview} />
        </div>
    );
};
