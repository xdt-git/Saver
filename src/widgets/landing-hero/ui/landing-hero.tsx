import telegramImg from "@/shared/assets/telegram.webp";
import mobileImg from "@/shared/assets/mobile.webp";
import desktopImg from "@/shared/assets/desktop.webp";
import webImg from "@/shared/assets/web.webp";
import "@/shared/styles/global.scss";
import "@/shared/ui/button/button.scss";
import "./landing-hero.scss";
import { Link } from "react-router-dom";

export const LandingHero = () => {
    return (
        <div className="left-container">
            <h1 className="glow-text">
                Universal Saver - <br />
                Сохрани воспоминания
            </h1>
            <span className="glow-text">
                Сохрани все, что тебе хочется у нас
            </span>
            <Link to="/Save">
                <button className="gradient-button btn-margin">Начать</button>
            </Link>
            <div className="img_links">
                <button className="transparent-button" id="telegram_shadow">
                    <img
                        src={telegramImg}
                        className="pictures_size"
                        alt="telegram"
                    />
                </button>
                <button className="transparent-button" id="mobile_shadow">
                    <img
                        src={mobileImg}
                        className="pictures_size"
                        alt="mobile"
                    />
                </button>
                <button className="transparent-button" id="desktop_shadow">
                    <img
                        src={desktopImg}
                        className="pictures_size"
                        alt="desktop"
                    />
                </button>
                <button className="transparent-button" id="web_shadow">
                    <img src={webImg} className="pictures_size" alt="web" />
                </button>
            </div>
        </div>
    );
};
