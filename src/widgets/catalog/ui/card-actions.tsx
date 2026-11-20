import type { ContentItem } from "@/entities/content";
import { RatePicker } from "@/features/rate-content";
import { StatusPicker } from "@/features/set-library-status";

/** Status and rating controls, the same on cards, in the random pick and on the details page. */
export const CardActions = ({ item }: { item: ContentItem }) => (
    <>
        <StatusPicker item={item} />
        <RatePicker item={item} />
    </>
);
