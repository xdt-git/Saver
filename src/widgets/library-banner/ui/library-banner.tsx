import subtitle from "@/shared/assets/subtitle.webp";
import styles from "./library-banner.module.scss";

export const LibraryBanner = () => {
    return (
        <div>
            <img alt="Subtitle" src={subtitle} className={styles.subtitle} />
        </div>
    );
};
