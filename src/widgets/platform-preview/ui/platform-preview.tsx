import allWeb from "@/shared/assets/all_web.webp";
import allPhone from "@/shared/assets/all_mobile.webp";
import styles from "./platform-preview.module.scss";

export const PlatformPreview = () => {
    const img = [
        { img: allWeb, alt: "Web Img" },
        { img: allPhone, alt: "Phone Img" },
    ] as const;
    return (
        <div>
            <img src={img[0].img} alt={img[0].alt} className={styles.preview} />
        </div>
    );
};
