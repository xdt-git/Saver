import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ContentForm,
    contentApi,
    toContentFormErrors,
    updateContentInCache,
    type ContentItem,
    type ContentPayload,
} from "@/entities/content";
import { libraryKeys } from "@/entities/library";
import { useSession } from "@/entities/session";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import { useToast } from "@/shared/ui/toast";
import { canEditContent } from "../model/can-edit";

/** "Edit" for the user's own content: the same form as adding, prefilled. */
export const EditContentButton = ({ item }: { item: ContentItem }) => {
    const { t } = useTranslation();
    const toast = useToast();
    const queryClient = useQueryClient();
    const { user } = useSession();
    const [open, setOpen] = useState(false);

    const mutation = useMutation({
        mutationFn: (payload: ContentPayload) => contentApi.replace(item.id, payload),
        onSuccess: (updated) => {
            // PUT returns the item without the viewer part: keep the one we have.
            updateContentInCache(queryClient, item.id, (current) => ({
                ...updated,
                viewer: current.viewer,
            }));
            void queryClient.invalidateQueries({ queryKey: libraryKeys.all });
            toast.success(t("collection.saved"));
            setOpen(false);
        },
        onError: (error) => {
            if (!toContentFormErrors(error)) toast.apiError(error);
        },
    });

    if (!canEditContent(item, user?.id)) return null;

    return (
        <>
            <Button variant="secondary" onClick={() => setOpen(true)}>
                {t("collection.editContent")}
            </Button>
            <Modal open={open} onClose={() => setOpen(false)} title={t("collection.editTitle")}>
                <ContentForm
                    initial={item}
                    submitLabel={t("common.save")}
                    isSubmitting={mutation.isPending}
                    serverErrors={toContentFormErrors(mutation.error)}
                    onSubmit={(payload) => mutation.mutate(payload)}
                />
            </Modal>
        </>
    );
};
