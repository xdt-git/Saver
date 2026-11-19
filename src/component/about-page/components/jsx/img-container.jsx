import allWeb from "../../../../assets/all_web.png";
import allPhone from "../../../../assets/all_mobile.png";

export const ImgCase = () => {
    const img = [
        { img: allWeb, alt: "Web Img" },
        { img: allPhone, alt: "Phone Img" },
    ];
    return (
        <div>
            <img
                src={img[0].img}
                alt={img[0].alt}
                className=""
                width="1000px"
            />
        </div>
    );
};
