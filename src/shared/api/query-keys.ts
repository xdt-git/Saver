import type { QueryParams } from "./types";

/**
 * Builds hierarchical query keys for one resource, so keys are never typed by hand:
 *   const contentKeys = createQueryKeys("content");
 *   contentKeys.all            -> ["content"]                    (invalidate everything)
 *   contentKeys.lists()        -> ["content", "list"]            (invalidate all lists)
 *   contentKeys.list(filters)  -> ["content", "list", filters]
 *   contentKeys.detail(42)     -> ["content", "detail", 42]
 */
export const createQueryKeys = <Scope extends string>(scope: Scope) => {
    const all = [scope] as const;
    return {
        all,
        lists: () => [...all, "list"] as const,
        list: (params: QueryParams = {}) => [...all, "list", params] as const,
        details: () => [...all, "detail"] as const,
        detail: (id: string | number) => [...all, "detail", id] as const,
    };
};
