import subtitle from "@/shared/assets/subtitle.webp";
import "./library-banner.scss";

export const LibraryBanner = () => {
    return (
        <div>
            <img alt="Subtitle" src={subtitle} className="subtitle" />
        </div>
    );
};
