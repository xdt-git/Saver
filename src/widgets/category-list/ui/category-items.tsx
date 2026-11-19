import { CATEGORIES, CategoryCard } from "@/entities/category";
import { utilities } from "@/shared/styles";

export const CategoryItems = () => (
    <section className={utilities.column}>
        {CATEGORIES.map((category) => (
            <CategoryCard key={category.id} category={category} />
        ))}
    </section>
);
