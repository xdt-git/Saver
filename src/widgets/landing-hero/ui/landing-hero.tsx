import telegramImg from "@/shared/assets/telegram.webp";
import mobileImg from "@/shared/assets/mobile.webp";
import desktopImg from "@/shared/assets/desktop.webp";
import webImg from "@/shared/assets/web.webp";
import { utilities } from "@/shared/styles";
import { buttonStyles } from "@/shared/ui/button";
import styles from "./landing-hero.module.scss";
import { Link } from "react-router-dom";

const platforms = [
    { id: "telegram", img: telegramImg },
    { id: "mobile", img: mobileImg },
    { id: "desktop", img: desktopImg },
    { id: "web", img: webImg },
];

export const LandingHero = () => {
    return (
        <div className={styles.leftContainer}>
            <h1 className={utilities.glowText}>
                Universal Saver - <br />
                Сохрани воспоминания
            </h1>
            <span className={utilities.glowText}>
                Сохрани все, что тебе хочется у нас
            </span>
            <Link to="/Save">
                <button className={`${buttonStyles.gradientButton} ${styles.btnMargin}`}>
                    Начать
                </button>
            </Link>
            <div className={styles.imgLinks}>
                {platforms.map((platform) => (
                    <button key={platform.id} className={buttonStyles.transparentButton}>
                        <img
                            src={platform.img}
                            className={styles.picturesSize}
                            alt={platform.id}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
};
