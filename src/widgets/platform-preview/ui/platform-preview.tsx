import { useTranslation } from "react-i18next";
import { DEFAULT_PLATFORM, getPlatform, type PlatformId } from "@/shared/config/platforms";
import styles from "./platform-preview.module.scss";

interface PlatformPreviewProps {
    platform: PlatformId;
}

/**
 * Screenshot of the selected platform. Platforms without their own design yet
 * (Telegram, desktop) show the general product overview.
 */
export const PlatformPreview = ({ platform }: PlatformPreviewProps) => {
    const { t } = useTranslation();
    const preview = getPlatform(platform).preview ?? getPlatform(DEFAULT_PLATFORM).preview;

    return (
        <div>
            <img
                key={preview}
                src={preview}
                alt={t("landing.previewAlt")}
                className={styles.preview}
                data-platform={platform}
            />
        </div>
    );
};
