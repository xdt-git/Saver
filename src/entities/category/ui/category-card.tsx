import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import { Text } from "@/shared/ui/text";
import type { Category } from "../model/types";
import styles from "./category-card.module.scss";

interface CategoryCardProps {
    category: Category;
}

export const CategoryCard = ({ category }: CategoryCardProps) => {
    const { t } = useTranslation();

    return (
        <div className={styles.card}>
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
