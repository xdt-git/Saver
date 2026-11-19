import "@/shared/ui/button/button.scss";
import "@/shared/styles/global.scss";
import type { Category } from "../model/types";

type CategoryCardProps = Pick<Category, "description" | "altBlue" | "imgBlue">;

export const CategoryCard = ({ description, altBlue, imgBlue }: CategoryCardProps) => {
    return (
        <div className="flex">
            <img alt={altBlue} src={imgBlue} />
            <div className="column">
                <span className="glow-text">{description}</span>
                <button className="gradient-button">Сохранить</button>
            </div>
        </div>
    );
};
