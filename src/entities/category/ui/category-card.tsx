import { Button } from "@/shared/ui/button";
import { Text } from "@/shared/ui/text";
import type { Category } from "../model/types";
import styles from "./category-card.module.scss";

type CategoryCardProps = Pick<Category, "description" | "altBlue" | "imgBlue">;

export const CategoryCard = ({ description, altBlue, imgBlue }: CategoryCardProps) => {
    return (
        <div className={styles.card}>
            <img alt={altBlue} src={imgBlue} className={styles.image} />
            <div className={styles.content}>
                <Text glow>{description}</Text>
                <Button>Сохранить</Button>
            </div>
        </div>
    );
};
