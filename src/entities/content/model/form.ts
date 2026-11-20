import { isApiError } from "@/shared/api";
import { isImageSource } from "@/shared/lib";
import type { ContentType } from "@/shared/config/content";
import type { ContentItem } from "./types";

/** Same limits as the API (saver-api: src/validators/content.validators.ts). */
export const CONTENT_LIMITS = {
    title: 300,
    description: 5000,
    yearMin: 1870,
    yearMax: 2100,
    runtimeMax: 10_000,
    episodesMax: 100_000,
    episodeRuntimeMax: 1_000,
    genresMax: 10,
} as const;

/** Which duration fields make sense for a type (real durations only, never guessed). */
export const DURATION_FIELDS: Record<ContentType, { runtime: boolean; episodes: boolean }> = {
    film: { runtime: true, episodes: false },
    cartoon: { runtime: true, episodes: false },
    other: { runtime: true, episodes: false },
    series: { runtime: false, episodes: true },
    anime: { runtime: true, episodes: true },
    game: { runtime: false, episodes: false },
};

/** Form state: text inputs keep strings until submit. */
export interface ContentFormValues {
    type: ContentType;
    title: string;
    originalTitle: string;
    releaseYear: string;
    description: string;
    posterUrl: string;
    runtimeMinutes: string;
    episodeCount: string;
    episodeRuntimeMinutes: string;
    genres: string[];
}

/** Body of POST and PUT /content. */
export interface ContentPayload {
    type: ContentType;
    title: string;
    originalTitle: string | null;
    releaseYear: number | null;
    description: string | null;
    posterUrl: string | null;
    runtimeMinutes: number | null;
    episodeCount: number | null;
    episodeRuntimeMinutes: number | null;
    genres: string[];
}

export type ContentFormField = Exclude<keyof ContentFormValues, "type">;
/** Translation keys under contentForm.errors.* */
export type ContentFormError =
    | "required"
    | "tooLong"
    | "year"
    | "positive"
    | "url"
    | "tooMany"
    | "unknownGenre"
    | "invalid";

const str = (value: number | string | null) => (value === null ? "" : String(value));

export const toFormValues = (item?: ContentItem): ContentFormValues => ({
    type: item?.type ?? "film",
    title: item?.title ?? "",
    originalTitle: item?.originalTitle ?? "",
    releaseYear: str(item?.releaseYear ?? null),
    description: item?.description ?? "",
    posterUrl: item?.posterUrl ?? "",
    runtimeMinutes: str(item?.runtimeMinutes ?? null),
    episodeCount: str(item?.episodeCount ?? null),
    episodeRuntimeMinutes: str(item?.episodeRuntimeMinutes ?? null),
    genres: item?.genres.map((genre) => genre.slug) ?? [],
});

const isWholeIn = (raw: string, min: number, max: number) => {
    const value = Number(raw);
    return Number.isInteger(value) && value >= min && value <= max;
};

export const validateContentForm = (
    values: ContentFormValues,
): Partial<Record<ContentFormField, ContentFormError>> => {
    const errors: Partial<Record<ContentFormField, ContentFormError>> = {};
    const fields = DURATION_FIELDS[values.type];
    const positive = (field: ContentFormField, max: number) => {
        const raw = values[field] as string;
        if (raw.trim() !== "" && !isWholeIn(raw, 1, max)) errors[field] = "positive";
    };

    if (!values.title.trim()) errors.title = "required";
    else if (values.title.trim().length > CONTENT_LIMITS.title) errors.title = "tooLong";
    if (values.originalTitle.trim().length > CONTENT_LIMITS.title) errors.originalTitle = "tooLong";
    if (values.description.trim().length > CONTENT_LIMITS.description) {
        errors.description = "tooLong";
    }
    if (
        values.releaseYear.trim() !== "" &&
        !isWholeIn(values.releaseYear, CONTENT_LIMITS.yearMin, CONTENT_LIMITS.yearMax)
    ) {
        errors.releaseYear = "year";
    }
    if (values.posterUrl.trim() && !isImageSource(values.posterUrl.trim())) {
        errors.posterUrl = "url";
    }
    if (fields.runtime) positive("runtimeMinutes", CONTENT_LIMITS.runtimeMax);
    if (fields.episodes) {
        positive("episodeCount", CONTENT_LIMITS.episodesMax);
        positive("episodeRuntimeMinutes", CONTENT_LIMITS.episodeRuntimeMax);
    }
    if (values.genres.length > CONTENT_LIMITS.genresMax) errors.genres = "tooMany";
    return errors;
};

const text = (raw: string) => raw.trim() || null;
const num = (raw: string, enabled: boolean) => (enabled && raw.trim() ? Number(raw) : null);

/** Trimmed payload; durations that do not apply to the type are sent as empty. */
export const toContentPayload = (values: ContentFormValues): ContentPayload => {
    const fields = DURATION_FIELDS[values.type];
    return {
        type: values.type,
        title: values.title.trim(),
        originalTitle: text(values.originalTitle),
        releaseYear: num(values.releaseYear, true),
        description: text(values.description),
        posterUrl: text(values.posterUrl),
        runtimeMinutes: num(values.runtimeMinutes, fields.runtime),
        episodeCount: num(values.episodeCount, fields.episodes),
        episodeRuntimeMinutes: num(values.episodeRuntimeMinutes, fields.episodes),
        genres: values.genres,
    };
};

const FORM_FIELDS: readonly ContentFormField[] = [
    "title",
    "originalTitle",
    "releaseYear",
    "description",
    "posterUrl",
    "runtimeMinutes",
    "episodeCount",
    "episodeRuntimeMinutes",
    "genres",
];

/** Field errors from the API (422) mapped onto the form; undefined for other errors. */
export const toContentFormErrors = (
    error: unknown,
): Partial<Record<ContentFormField, ContentFormError>> | undefined => {
    if (!isApiError(error) || !error.fields) return undefined;
    const result: Partial<Record<ContentFormField, ContentFormError>> = {};
    for (const field of FORM_FIELDS) {
        if (!error.fields[field]) continue;
        result[field] = field === "genres" ? "unknownGenre" : "invalid";
    }
    return Object.keys(result).length > 0 ? result : undefined;
};
