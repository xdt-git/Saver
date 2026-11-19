import { useTranslation } from "react-i18next";
import desktopImg from "@/shared/assets/desktop.webp";
import mobileImg from "@/shared/assets/mobile.webp";
import telegramImg from "@/shared/assets/telegram.webp";
import webImg from "@/shared/assets/web.webp";
import { Button } from "@/shared/ui/button";
import { Text } from "@/shared/ui/text";
import styles from "./landing-hero.module.scss";

const platforms = [
    { id: "telegram", img: telegramImg },
    { id: "mobile", img: mobileImg },
    { id: "desktop", img: desktopImg },
    { id: "web", img: webImg },
] as const;

export const LandingHero = () => {
    const { t } = useTranslation();

    return (
        <div className={styles.leftContainer}>
            <Text as="h1" glow>
                {t("landing.titleFirstLine")} <br />
                {t("landing.titleSecondLine")}
            </Text>
            <Text glow>{t("landing.subtitle")}</Text>
            <Button to="/Save" className={styles.btnMargin}>
                {t("landing.start")}
            </Button>
            <div className={styles.imgLinks}>
                {platforms.map((platform) => (
                    <Button key={platform.id} variant="icon">
                        <img
                            src={platform.img}
                            className={styles.picturesSize}
                            alt={t(`landing.platforms.${platform.id}`)}
                        />
                    </Button>
                ))}
            </div>
        </div>
    );
};
