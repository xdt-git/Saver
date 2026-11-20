import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { activityKeys } from "@/entities/activity";
import { useSession, type SessionUser } from "@/entities/session";
import { userApi, userKeys, type PublicProfile } from "@/entities/user";
import { isApiError, uploadImage } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { isImageSource } from "@/shared/lib";
import { ImageField } from "@/shared/ui/image-field";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";
import { Textarea } from "@/shared/ui/textarea";
import { useToast } from "@/shared/ui/toast";
import { PROFILE_LIMITS } from "../model/limits";
import styles from "./edit-profile.module.scss";

interface Values {
    displayName: string;
    bio: string;
    avatarUrl: string;
    isPrivate: boolean;
}

type Errors = Partial<Record<"displayName" | "bio" | "avatarUrl", string>>;

const fromProfile = (p: PublicProfile): Values => ({
    displayName: p.displayName ?? "",
    bio: p.bio ?? "",
    avatarUrl: p.avatarUrl ?? "",
    isPrivate: p.isPrivate,
});

/** "Edit profile": display name, bio, avatar link and privacy, saved with PATCH /users/me. */
export const EditProfileButton = ({ profile }: { profile: PublicProfile }) => {
    const { t } = useTranslation();
    const toast = useToast();
    const queryClient = useQueryClient();
    const { signIn } = useSession();
    const [open, setOpen] = useState(false);
    const [values, setValues] = useState(() => fromProfile(profile));
    const [errors, setErrors] = useState<Errors>({});

    const validate = (v: Values): Errors => {
        const found: Errors = {};
        if (v.displayName.trim().length > PROFILE_LIMITS.displayName) {
            found.displayName = t("profile.errors.tooLong", { max: PROFILE_LIMITS.displayName });
        }
        if (v.bio.trim().length > PROFILE_LIMITS.bio) {
            found.bio = t("profile.errors.tooLong", { max: PROFILE_LIMITS.bio });
        }
        if (v.avatarUrl.trim() && !isImageSource(v.avatarUrl.trim())) {
            found.avatarUrl = t("contentForm.errors.url");
        }
        return found;
    };

    const mutation = useMutation({
        mutationFn: (v: Values) =>
            // Empty strings clear a field on the server.
            userApi.updateMe<SessionUser>({
                displayName: v.displayName.trim(),
                bio: v.bio.trim(),
                avatarUrl: v.avatarUrl.trim(),
                isPrivate: v.isPrivate,
            }),
        onSuccess: (user) => {
            signIn(user);
            queryClient.setQueryData<PublicProfile>(
                userKeys.profile(profile.id),
                (current) =>
                    current && {
                        ...current,
                        displayName: user.displayName,
                        bio: user.bio,
                        avatarUrl: user.avatarUrl,
                        isPrivate: user.isPrivate,
                    },
            );
            void queryClient.invalidateQueries({ queryKey: activityKeys.all });
            toast.success(t("profile.saved"));
            setOpen(false);
        },
        onError: (error) => {
            if (isApiError(error) && error.fields) {
                setErrors(
                    Object.fromEntries(
                        Object.keys(error.fields).map((field) => [
                            field,
                            t("auth.validation.invalid"),
                        ]),
                    ),
                );
            } else {
                toast.apiError(error);
            }
        },
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const found = validate(values);
        setErrors(found);
        if (Object.keys(found).length === 0) mutation.mutate(values);
    };
    const text = (field: keyof Errors) => ({
        value: values[field],
        error: errors[field],
        onChange: (event: { target: { value: string } }) =>
            setValues((v) => ({ ...v, [field]: event.target.value })),
    });

    return (
        <>
            <Button
                size="md"
                variant="secondary"
                onClick={() => {
                    setValues(fromProfile(profile));
                    setErrors({});
                    setOpen(true);
                }}
            >
                {t("profile.edit")}
            </Button>
            <Modal open={open} onClose={() => setOpen(false)} title={t("profile.editTitle")}>
                <form className={styles.form} onSubmit={submit} noValidate>
                    <Input
                        fieldClassName={styles.wide}
                        label={t("profile.displayName")}
                        hint={t("profile.displayNameHint")}
                        autoFocus
                        {...text("displayName")}
                    />
                    <Textarea
                        fieldClassName={styles.wide}
                        label={t("profile.bio")}
                        {...text("bio")}
                    />
                    <ImageField
                        fieldClassName={styles.wide}
                        shape="avatar"
                        label={t("profile.avatarUrl")}
                        hint={t("contentForm.posterHint")}
                        value={values.avatarUrl}
                        error={errors.avatarUrl}
                        onChange={(avatarUrl) => setValues((v) => ({ ...v, avatarUrl }))}
                        onUpload={(file) => uploadImage("avatar", file)}
                    />
                    <Checkbox
                        label={t("profile.private")}
                        hint={t("profile.privateHint")}
                        checked={values.isPrivate}
                        onChange={(event) =>
                            setValues((v) => ({ ...v, isPrivate: event.target.checked }))
                        }
                    />
                    <Button type="submit" size="md" disabled={mutation.isPending}>
                        {t("common.save")}
                    </Button>
                </form>
            </Modal>
        </>
    );
};
