import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { contentApi, contentKeys } from "../api/content-api";
import type { ContentFilters, ContentListParams } from "./types";

/** One catalog page; the previous page stays on screen while the next one loads. */
export const useContentList = (params: ContentListParams) =>
    useQuery({
        queryKey: contentKeys.list({ ...params }),
        queryFn: ({ signal }) => contentApi.list(params, signal),
        placeholderData: keepPreviousData,
    });

/** A random item for the filters; `attempt` changes on "another one". */
export const useRandomContent = (filters: ContentFilters, attempt: number, enabled: boolean) =>
    useQuery({
        queryKey: contentKeys.random(filters, attempt),
        queryFn: ({ signal }) => contentApi.random(filters, signal),
        enabled,
        staleTime: Infinity,
    });

export const useContent = (id: number) =>
    useQuery({
        queryKey: contentKeys.detail(id),
        queryFn: ({ signal }) => contentApi.byId(id, signal),
    });

/** Suggestions for the search box; empty text asks nothing. */
export const useContentSuggest = (query: string, language: string) =>
    useQuery({
        queryKey: contentKeys.suggest(query.trim().toLowerCase(), language),
        queryFn: ({ signal }) => contentApi.suggest(query.trim(), language, signal),
        enabled: query.trim().length > 0,
        placeholderData: keepPreviousData,
        staleTime: 60_000,
    });

/** Genres rarely change: loaded once per session. */
export const useGenres = () =>
    useQuery({ queryKey: contentKeys.genres(), queryFn: contentApi.genres, staleTime: Infinity });
