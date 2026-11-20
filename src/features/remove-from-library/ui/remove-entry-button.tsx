import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { libraryApi, libraryKeys } from "@/entities/library";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import { useToast } from "@/shared/ui/toast";

interface RemoveEntryButtonProps {
    entryId: number;
    title: string;
}

/** Removes an item from the library after a confirmation; the catalog item itself stays. */
export const RemoveEntryButton = ({ entryId, title }: RemoveEntryButtonProps) => {
    const { t } = useTranslation();
    const toast = useToast();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);

    const mutation = useMutation({
        mutationFn: () => libraryApi.remove(entryId),
        onSuccess: () => {
            setOpen(false);
            void queryClient.invalidateQueries({ queryKey: libraryKeys.all });
            // Catalog cards show the viewer's status: refresh them too.
            void queryClient.invalidateQueries({ queryKey: ["content"] });
            toast.success(t("collection.removed", { title }));
        },
        onError: (error) => toast.apiError(error),
    });

    return (
        <>
            <Button variant="secondary" onClick={() => setOpen(true)}>
                {t("common.delete")}
            </Button>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title={t("collection.removeTitle")}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setOpen(false)}>
                            {t("common.cancel")}
                        </Button>
                        <Button
                            size="md"
                            disabled={mutation.isPending}
                            onClick={() => mutation.mutate()}
                        >
                            {t("collection.removeConfirm")}
                        </Button>
                    </>
                }
            >
                <p>{t("collection.removeText", { title })}</p>
            </Modal>
        </>
    );
};
