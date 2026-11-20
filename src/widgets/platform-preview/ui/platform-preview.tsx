import { useTranslation } from "react-i18next";
import { getPlatform, type PlatformId } from "@/shared/config/platforms";
import styles from "./platform-preview.module.scss";

interface PlatformPreviewProps {
    platform: PlatformId;
}

/** Screenshot of the selected platform. */
export const PlatformPreview = ({ platform }: PlatformPreviewProps) => {
    const { t } = useTranslation();
    const { preview } = getPlatform(platform);

    return (
        <div className={styles.root}>
            <img
                key={preview}
                src={preview}
                alt={t(`landing.previews.${platform}`)}
                className={styles.preview}
                data-platform={platform}
            />
        </div>
    );
};
