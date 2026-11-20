import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { libraryApi, libraryKeys, type LibraryEntry } from "@/entities/library";
import { statisticsKeys } from "@/entities/statistics";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";
import { Textarea } from "@/shared/ui/textarea";
import { useToast } from "@/shared/ui/toast";
import styles from "./edit-entry.module.scss";

export const NOTES_MAX = 1000;

/** yyyy-mm-dd of an ISO date (what <input type="date"> expects), in UTC. */
const toDateInput = (iso: string | null) => (iso ? iso.slice(0, 10) : "");
const today = () => new Date().toISOString().slice(0, 10);

interface EditEntryButtonProps {
    entry: LibraryEntry;
    title: string;
}

/** Notes and, for completed items, the completion date (used by statistics). */
export const EditEntryButton = ({ entry, title }: EditEntryButtonProps) => {
    const { t } = useTranslation();
    const toast = useToast();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [notes, setNotes] = useState(entry.notes ?? "");
    const [completedAt, setCompletedAt] = useState(toDateInput(entry.completedAt));
    const completed = entry.status === "completed";
    const notesTooLong = notes.trim().length > NOTES_MAX;
    const dateInFuture = completed && completedAt > today();

    const mutation = useMutation({
        mutationFn: () =>
            libraryApi.update(entry.id, {
                notes: notes.trim() || null,
                ...(completed &&
                    completedAt !== toDateInput(entry.completedAt) &&
                    completedAt && { completedAt: `${completedAt}T12:00:00.000Z` }),
            }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: libraryKeys.all });
            void queryClient.invalidateQueries({ queryKey: statisticsKeys.all });
            toast.success(t("collection.saved"));
            setOpen(false);
        },
        onError: (error) => toast.apiError(error),
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (!notesTooLong && !dateInFuture) mutation.mutate();
    };

    return (
        <>
            <Button
                variant="secondary"
                onClick={() => {
                    setNotes(entry.notes ?? "");
                    setCompletedAt(toDateInput(entry.completedAt));
                    setOpen(true);
                }}
            >
                {t("collection.editEntry")}
            </Button>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title={t("collection.editEntryTitle", { title })}
            >
                <form className={styles.form} onSubmit={submit} noValidate>
                    <Textarea
                        fieldClassName={styles.wide}
                        label={t("collection.notes")}
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        error={
                            notesTooLong
                                ? t("collection.notesTooLong", { max: NOTES_MAX })
                                : undefined
                        }
                    />
                    {completed && (
                        <Input
                            fieldClassName={styles.date}
                            type="date"
                            max={today()}
                            label={t("collection.completedAt")}
                            hint={t("collection.completedAtHint")}
                            value={completedAt}
                            onChange={(event) => setCompletedAt(event.target.value)}
                            error={dateInFuture ? t("collection.futureDate") : undefined}
                        />
                    )}
                    <Button type="submit" size="md" disabled={mutation.isPending}>
                        {t("common.save")}
                    </Button>
                </form>
            </Modal>
        </>
    );
};
