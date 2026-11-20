import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CONTENT_TYPES } from "@/shared/config/content";
import { uploadImage } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { ChipGroup } from "@/shared/ui/chip-group";
import { ImageField } from "@/shared/ui/image-field";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { useContentLabels } from "../lib/labels";
import {
    CONTENT_LIMITS,
    DURATION_FIELDS,
    toContentPayload,
    toFormValues,
    validateContentForm,
    type ContentFormError,
    type ContentFormField,
    type ContentFormValues,
    type ContentPayload,
} from "../model/form";
import { useGenres } from "../model/queries";
import type { ContentItem } from "../model/types";
import styles from "./content-form.module.scss";

export type ContentFormErrors = Partial<Record<ContentFormField, ContentFormError>>;

interface ContentFormProps {
    /** Item to edit; empty form when omitted. */
    initial?: ContentItem;
    /** Type of a new item (ignored when editing). */
    defaultType?: ContentFormValues["type"];
    submitLabel: string;
    isSubmitting: boolean;
    onSubmit: (payload: ContentPayload) => void;
    /** Field errors from the API (mapped by the caller). */
    serverErrors?: ContentFormErrors;
    /** Extra controls above the submit button (e.g. the initial library status). */
    children?: ReactNode;
}

/** Add or edit manually created content, with the same rules as the API. */
export const ContentForm = ({
    initial,
    defaultType,
    submitLabel,
    isSubmitting,
    onSubmit,
    serverErrors,
    children,
}: ContentFormProps) => {
    const { t } = useTranslation();
    const labels = useContentLabels();
    const genres = useGenres();
    const [values, setValues] = useState<ContentFormValues>(() => ({
        ...toFormValues(initial),
        ...(!initial && defaultType && { type: defaultType }),
    }));
    const [errors, setErrors] = useState<ContentFormErrors>({});
    const [submitted, setSubmitted] = useState(false);
    const shown = { ...errors, ...serverErrors };
    const durations = DURATION_FIELDS[values.type];

    const set = (patch: Partial<ContentFormValues>) => {
        const next = { ...values, ...patch };
        setValues(next);
        if (submitted) setErrors(validateContentForm(next));
    };
    const error = (field: ContentFormField) =>
        shown[field] && t(`contentForm.errors.${shown[field]}`, { max: CONTENT_LIMITS.genresMax });
    const textField = (field: ContentFormField) => ({
        name: field,
        value: values[field] as string,
        error: error(field),
        onChange: (event: { target: { value: string } }) => set({ [field]: event.target.value }),
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        setSubmitted(true);
        const found = validateContentForm(values);
        setErrors(found);
        if (Object.keys(found).length === 0) onSubmit(toContentPayload(values));
    };

    return (
        <form className={styles.form} onSubmit={submit} noValidate aria-busy={isSubmitting}>
            <div className={styles.row}>
                <Select
                    fieldClassName={styles.narrow}
                    label={t("contentForm.type")}
                    value={values.type}
                    onChange={(event) =>
                        set({ type: event.target.value as ContentFormValues["type"] })
                    }
                    options={CONTENT_TYPES.map((type) => ({
                        value: type,
                        label: labels.type(type),
                    }))}
                />
                <Input
                    fieldClassName={styles.narrow}
                    label={t("contentForm.year")}
                    type="number"
                    inputMode="numeric"
                    {...textField("releaseYear")}
                />
            </div>
            <Input
                fieldClassName={styles.wide}
                label={t("contentForm.title")}
                autoFocus
                {...textField("title")}
            />
            <Input
                fieldClassName={styles.wide}
                label={t("contentForm.originalTitle")}
                {...textField("originalTitle")}
            />
            {(durations.runtime || durations.episodes) && (
                <div className={styles.row}>
                    {durations.runtime && (
                        <Input
                            fieldClassName={styles.narrow}
                            label={t("contentForm.runtime")}
                            type="number"
                            inputMode="numeric"
                            {...textField("runtimeMinutes")}
                        />
                    )}
                    {durations.episodes && (
                        <>
                            <Input
                                fieldClassName={styles.narrow}
                                label={t("contentForm.episodes")}
                                type="number"
                                inputMode="numeric"
                                {...textField("episodeCount")}
                            />
                            <Input
                                fieldClassName={styles.narrow}
                                label={t("contentForm.episodeRuntime")}
                                type="number"
                                inputMode="numeric"
                                {...textField("episodeRuntimeMinutes")}
                            />
                        </>
                    )}
                </div>
            )}
            <ChipGroup
                label={t("contentForm.genres")}
                options={(genres.data ?? []).map((genre) => ({
                    value: genre.slug,
                    label: labels.genre(genre),
                }))}
                value={values.genres}
                onChange={(next) => set({ genres: next })}
                max={CONTENT_LIMITS.genresMax}
                error={error("genres")}
            />
            <ImageField
                fieldClassName={styles.wide}
                shape="poster"
                label={t("contentForm.poster")}
                hint={t("contentForm.posterHint")}
                value={values.posterUrl}
                error={error("posterUrl")}
                onChange={(posterUrl) => set({ posterUrl })}
                onUpload={(file) => uploadImage("poster", file)}
            />
            <Textarea
                fieldClassName={styles.wide}
                label={t("contentForm.description")}
                {...textField("description")}
            />
            {children}
            <Button type="submit" size="md" disabled={isSubmitting} className={styles.submit}>
                {submitLabel}
            </Button>
        </form>
    );
};
