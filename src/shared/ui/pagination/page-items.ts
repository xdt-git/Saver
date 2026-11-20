/** A page number or a gap ("…") between them. */
export type PageItem = number | "gap";

/**
 * Pages worth a button: the first, the last and a few around the current one; longer
 * runs in between become a gap. 7 of 524 → [1, "gap", 6, 7, 8, "gap", 524].
 */
export const pageItems = (page: number, totalPages: number, around = 1): PageItem[] => {
    const shown = new Set([1, totalPages]);
    for (let p = page - around; p <= page + around; p++) {
        if (p >= 1 && p <= totalPages) shown.add(p);
    }
    const sorted = [...shown].sort((a, b) => a - b);
    const items: PageItem[] = [];
    sorted.forEach((p, index) => {
        const previous = sorted[index - 1];
        if (previous !== undefined && p - previous === 2) items.push(previous + 1);
        else if (previous !== undefined && p - previous > 2) items.push("gap");
        items.push(p);
    });
    return items;
};
