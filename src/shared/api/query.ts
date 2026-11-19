import type { QueryParams } from "./types";

/**
 * Builds "?a=1&tag=x&tag=y" from an object. Empty values (undefined, null, "") are skipped,
 * so filter objects can be passed as they are.
 */
export const buildQuery = (params?: QueryParams): string => {
    if (!params) return "";
    const search = new URLSearchParams();
    for (const [key, raw] of Object.entries(params)) {
        const values = Array.isArray(raw) ? raw : [raw];
        for (const value of values) {
            if (value === undefined || value === null || value === "") continue;
            search.append(key, String(value));
        }
    }
    const query = search.toString();
    return query ? `?${query}` : "";
};
