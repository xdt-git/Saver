import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { updateContentInCache, type ContentItem } from "@/entities/content";
import { libraryKeys } from "@/entities/library";
import { statisticsKeys } from "@/entities/statistics";
import { useRequireSession } from "@/entities/session";
import { apiClient } from "@/shared/api";
import { RATING_VALUES } from "@/shared/config/content";
import { Select } from "@/shared/ui/select";
import { useToast } from "@/shared/ui/toast";
import styles from "./rate-picker.module.scss";

interface RateResult {
    value: number;
    rating: ContentItem["rating"];
}

const rateApi = {
    put: (contentId: number, value: number) =>
        apiClient.put<RateResult>(`/content/${contentId}/rating`, { value }),
    remove: (contentId: number) => apiClient.delete(`/content/${contentId}/rating`),
};

interface RatePickerProps {
    item: ContentItem;
}

/** The viewer's own 1–10 rating; choosing "—" removes it. Guests are sent to sign in. */
export const RatePicker = ({ item }: RatePickerProps) => {
    const { t } = useTranslation();
    const toast = useToast();
    const queryClient = useQueryClient();
    const requireSession = useRequireSession();
    const current = item.viewer?.rating ?? null;

    const mutation = useMutation({
        mutationFn: async (value: number | null) =>
            value === null ? (await rateApi.remove(item.id), null) : rateApi.put(item.id, value),
        onSuccess: (result) => {
            updateContentInCache(queryClient, item.id, (content) => ({
                ...content,
                // The API returns the new summary on save; after removal the background refresh brings it.
                rating: result?.rating ?? content.rating,
                viewer: {
                    libraryEntryId: content.viewer?.libraryEntryId ?? null,
                    status: content.viewer?.status ?? null,
                    rating: result?.value ?? null,
                },
            }));
            void queryClient.invalidateQueries({ queryKey: libraryKeys.all });
            void queryClient.invalidateQueries({ queryKey: statisticsKeys.all });
            toast.success(
                result ? t("rating.saved", { value: result.value }) : t("rating.removed"),
            );
        },
        onError: (error) => toast.apiError(error),
    });

    const onChange = requireSession((event: ChangeEvent<HTMLSelectElement>) => {
        mutation.mutate(event.target.value === "" ? null : Number(event.target.value));
    });

    return (
        <Select
            fieldClassName={styles.select}
            aria-label={t("rating.label", { title: item.title })}
            value={current ?? ""}
            onChange={onChange}
            disabled={mutation.isPending}
            placeholder={t("rating.none")}
            options={RATING_VALUES.map((value) => ({ value: String(value), label: `★ ${value}` }))}
        />
    );
};
