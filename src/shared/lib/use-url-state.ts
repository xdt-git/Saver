import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

/** A whole number from the URL, or undefined for empty or broken values. */
export const intParam = (raw: string | null) => {
    if (raw === null || raw === "") return undefined;
    const value = Number(raw);
    return Number.isInteger(value) ? value : undefined;
};

/** One of the allowed values, or undefined. */
export const oneOfParam = <T extends string>(raw: string | null, allowed: readonly T[]) =>
    allowed.includes(raw as T) ? (raw as T) : undefined;

/** Builds search params, skipping empty values (a clean state gives a clean URL). */
export const toSearchParams = (entries: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(entries)) {
        if (value !== undefined && value !== "") params.set(key, String(value));
    }
    return params;
};

/**
 * Screen state kept in the query string: shareable links, and the back button returns to
 * the previous state. `parse` must tolerate any input; `update` merges a partial change.
 */
export const useUrlState = <T>(
    parse: (params: URLSearchParams) => T,
    serialize: (state: T) => URLSearchParams,
) => {
    const [params, setParams] = useSearchParams();
    const state = useMemo(() => parse(params), [params, parse]);

    /** `replace` changes the URL without a new history entry (state the user did not pick). */
    const update = useCallback(
        (patch: Partial<T>, options?: { replace?: boolean }) =>
            setParams((current) => serialize({ ...parse(current), ...patch }), options),
        [setParams, parse, serialize],
    );

    return [state, update] as const;
};
