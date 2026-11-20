import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui/button";
import { Text } from "@/shared/ui/text";
import type { Category } from "../model/types";
import styles from "./category-card.module.scss";

interface CategoryCardProps {
    category: Category;
    /** Text on the left and picture on the right (for alternating lists). */
    reversed?: boolean;
}

export const CategoryCard = ({ category, reversed = false }: CategoryCardProps) => {
    const { t } = useTranslation();

    return (
        <div className={cn(styles.card, reversed && styles.reversed)} data-reversed={reversed}>
            <img
                alt={t(`categories.${category.id}.alt`)}
                src={category.imgBlue}
                className={styles.image}
            />
            <div className={styles.content}>
                <Text glow>{t(`categories.${category.id}.description`)}</Text>
                <Button>{t("common.save")}</Button>
            </div>
        </div>
    );
};
