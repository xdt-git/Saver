import { buttonStyles } from "@/shared/ui/button";
import { utilities } from "@/shared/styles";
import type { Category } from "../model/types";

type CategoryCardProps = Pick<Category, "description" | "altBlue" | "imgBlue">;

export const CategoryCard = ({ description, altBlue, imgBlue }: CategoryCardProps) => {
    return (
        <div className={utilities.flex}>
            <img alt={altBlue} src={imgBlue} />
            <div className={utilities.column}>
                <span className={utilities.glowText}>{description}</span>
                <button className={buttonStyles.gradientButton}>Сохранить</button>
            </div>
        </div>
    );
};
