import { CATEGORIES, CategoryCard } from "@/entities/category";
import styles from "./category-list.module.scss";

/** Category cards in a centered column; every second card is mirrored (zigzag). */
export const CategoryItems = () => (
    <section className={styles.list}>
        {CATEGORIES.map((category, index) => (
            <CategoryCard key={category.id} category={category} reversed={index % 2 === 1} />
        ))}
    </section>
);
