import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MdAdd } from "react-icons/md";
import {
    ContentForm,
    contentApi,
    contentKeys,
    toContentFormErrors,
    type ContentPayload,
} from "@/entities/content";
import { libraryApi, libraryKeys } from "@/entities/library";
import { LIBRARY_STATUSES, type ContentType, type LibraryStatus } from "@/shared/config/content";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import { SegmentedControl } from "@/shared/ui/segmented-control";
import { useToast } from "@/shared/ui/toast";
import styles from "./add-content.module.scss";

interface AddContentButtonProps {
    /** Status preselected in the form, e.g. the open library tab. */
    defaultStatus?: LibraryStatus;
    /** Type preselected in the form, e.g. the category the user came from. */
    defaultType?: ContentType;
}

/** "Add manually": creates the content item and puts it straight into the library. */
export const AddContentButton = ({
    defaultStatus = "planned",
    defaultType,
}: AddContentButtonProps) => {
    const { t } = useTranslation();
    const toast = useToast();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState<LibraryStatus>(defaultStatus);

    const mutation = useMutation({
        mutationFn: async (payload: ContentPayload) => {
            const created = await contentApi.create(payload);
            await libraryApi.add(created.id, status);
            return created;
        },
        onSuccess: (created) => {
            void queryClient.invalidateQueries({ queryKey: libraryKeys.all });
            void queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
            toast.success(t("collection.added", { title: created.title }));
            setOpen(false);
            mutation.reset();
        },
        onError: (error) => {
            if (!toContentFormErrors(error)) toast.apiError(error);
        },
    });

    return (
        <>
            <Button
                size="md"
                className={styles.trigger}
                onClick={() => {
                    setStatus(defaultStatus);
                    setOpen(true);
                }}
            >
                <MdAdd aria-hidden="true" /> {t("collection.addManually")}
            </Button>
            <Modal open={open} onClose={() => setOpen(false)} title={t("collection.addTitle")}>
                <ContentForm
                    defaultType={defaultType}
                    submitLabel={t("collection.addSubmit")}
                    isSubmitting={mutation.isPending}
                    serverErrors={toContentFormErrors(mutation.error)}
                    onSubmit={(payload) => mutation.mutate(payload)}
                >
                    <SegmentedControl
                        ariaLabel={t("collection.initialStatus")}
                        value={status}
                        onChange={setStatus}
                        options={LIBRARY_STATUSES.map((value) => ({
                            value,
                            label: t(`library.status.${value}`),
                        }))}
                    />
                </ContentForm>
            </Modal>
        </>
    );
};
