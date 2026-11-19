import allWeb from "@/shared/assets/all_web.webp";
import allPhone from "@/shared/assets/all_mobile.webp";

export const PlatformPreview = () => {
    const img = [
        { img: allWeb, alt: "Web Img" },
        { img: allPhone, alt: "Phone Img" },
    ] as const;
    return (
        <div>
            <img
                src={img[0].img}
                alt={img[0].alt}
                width="1000px"
            />
        </div>
    );
};
