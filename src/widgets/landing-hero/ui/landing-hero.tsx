import telegramImg from "@/shared/assets/telegram.webp";
import mobileImg from "@/shared/assets/mobile.webp";
import desktopImg from "@/shared/assets/desktop.webp";
import webImg from "@/shared/assets/web.webp";
import { Button } from "@/shared/ui/button";
import { Text } from "@/shared/ui/text";
import styles from "./landing-hero.module.scss";

const platforms = [
    { id: "telegram", img: telegramImg },
    { id: "mobile", img: mobileImg },
    { id: "desktop", img: desktopImg },
    { id: "web", img: webImg },
];

export const LandingHero = () => {
    return (
        <div className={styles.leftContainer}>
            <Text as="h1" glow>
                Universal Saver - <br />
                Сохрани воспоминания
            </Text>
            <Text glow>Сохрани все, что тебе хочется у нас</Text>
            <Button to="/Save" className={styles.btnMargin}>
                Начать
            </Button>
            <div className={styles.imgLinks}>
                {platforms.map((platform) => (
                    <Button key={platform.id} variant="icon">
                        <img src={platform.img} className={styles.picturesSize} alt={platform.id} />
                    </Button>
                ))}
            </div>
        </div>
    );
};
