import { utilities } from "@/shared/styles";
import { Button } from "@/shared/ui/button";
import { Text } from "@/shared/ui/text";
import type { Category } from "../model/types";

type CategoryCardProps = Pick<Category, "description" | "altBlue" | "imgBlue">;

export const CategoryCard = ({ description, altBlue, imgBlue }: CategoryCardProps) => {
    return (
        <div className={utilities.flex}>
            <img alt={altBlue} src={imgBlue} />
            <div className={utilities.column}>
                <Text glow>{description}</Text>
                <Button>Сохранить</Button>
            </div>
        </div>
    );
};
