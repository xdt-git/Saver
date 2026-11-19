/** Joins class names, skipping empty values: cn("a", isActive && "b") -> "a b". */
export const cn = (...classes: Array<string | false | null | undefined>): string =>
    classes.filter(Boolean).join(" ");
