import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { updateContentInCache, type ContentItem } from "@/entities/content";
import { libraryApi, libraryKeys } from "@/entities/library";
import { statisticsKeys } from "@/entities/statistics";
import { useRequireSession } from "@/entities/session";
import { LIBRARY_STATUSES, type LibraryStatus } from "@/shared/config/content";
import { SegmentedControl } from "@/shared/ui/segmented-control";
import { useToast } from "@/shared/ui/toast";

interface StatusPickerProps {
    item: ContentItem;
}

/**
 * Planned / Watching / Completed for one item. Adds it to the library the first time and
 * changes the status in place afterwards. Guests are sent to sign in.
 */
export const StatusPicker = ({ item }: StatusPickerProps) => {
    const { t } = useTranslation();
    const toast = useToast();
    const queryClient = useQueryClient();
    const requireSession = useRequireSession();
    const entryId = item.viewer?.libraryEntryId ?? null;

    const mutation = useMutation({
        mutationFn: (status: LibraryStatus) =>
            entryId === null
                ? libraryApi.add(item.id, status)
                : libraryApi.setStatus(entryId, status),
        onSuccess: (entry) => {
            updateContentInCache(queryClient, item.id, (current) => ({
                ...current,
                viewer: {
                    rating: current.viewer?.rating ?? null,
                    libraryEntryId: entry.id,
                    status: entry.status,
                },
            }));
            void queryClient.invalidateQueries({ queryKey: libraryKeys.all });
            void queryClient.invalidateQueries({ queryKey: statisticsKeys.all });
            toast.success(
                t("library.statusSaved", { status: t(`library.status.${entry.status}`) }),
            );
        },
        onError: (error) => toast.apiError(error),
    });

    const onChange = requireSession((status: LibraryStatus) => {
        if (status !== item.viewer?.status && !mutation.isPending) mutation.mutate(status);
    });

    return (
        <SegmentedControl
            ariaLabel={t("library.statusLabel", { title: item.title })}
            value={item.viewer?.status ?? undefined}
            onChange={onChange}
            options={LIBRARY_STATUSES.map((status) => ({
                value: status,
                label: t(`library.status.${status}`),
            }))}
        />
    );
};
