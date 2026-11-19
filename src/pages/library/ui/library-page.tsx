import { CategoryList } from "@/widgets/category-list";
import { LibraryBanner } from "@/widgets/library-banner";

export const LibraryPage = () => {
    return (
        <div>
            <LibraryBanner />
            <CategoryList />
        </div>
    );
};
