import { useTranslation } from "react-i18next";
import { PLATFORMS, getPlatform, type PlatformId } from "@/shared/config/platforms";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui/button";
import { Text } from "@/shared/ui/text";
import { useToast } from "@/shared/ui/toast";
import styles from "./landing-hero.module.scss";

interface LandingHeroProps {
    selectedPlatform: PlatformId;
    onSelectPlatform: (platform: PlatformId) => void;
}

/** Title, Start button and the platform switcher of the landing page. */
export const LandingHero = ({ selectedPlatform, onSelectPlatform }: LandingHeroProps) => {
    const { t } = useTranslation();
    const toast = useToast();
    const { action, actionLabel } = getPlatform(selectedPlatform);

    return (
        <div className={styles.leftContainer}>
            <Text as="h1" glow>
                {t("landing.titleFirstLine")} <br />
                {t("landing.titleSecondLine")}
            </Text>
            <Text glow>{t("landing.subtitle")}</Text>

            {action.kind === "route" ? (
                <Button to={action.to} className={styles.btnMargin}>
                    {t(`landing.actions.${actionLabel}`)}
                </Button>
            ) : (
                // Not released yet: apologize instead of leading to a fake link.
                <Button
                    className={styles.btnMargin}
                    onClick={() => toast.warning(t("landing.unavailable"))}
                >
                    {t(`landing.actions.${actionLabel}`)}
                </Button>
            )}

            <div className={styles.imgLinks} role="group" aria-label={t("landing.platformsLabel")}>
                {PLATFORMS.map((platform) => {
                    const isActive = platform.id === selectedPlatform;
                    return (
                        <Button
                            key={platform.id}
                            variant="icon"
                            aria-pressed={isActive}
                            className={cn(
                                styles.platform,
                                isActive && styles.active,
                                styles[platform.id],
                            )}
                            onClick={() => onSelectPlatform(platform.id)}
                        >
                            <img
                                src={platform.icon}
                                className={styles.picturesSize}
                                alt={t(`landing.platforms.${platform.id}`)}
                            />
                        </Button>
                    );
                })}
            </div>
        </div>
    );
};
