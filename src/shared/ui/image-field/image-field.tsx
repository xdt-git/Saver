import { useId, useRef, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage, IMAGE_UPLOAD, isApiError } from "@/shared/api";
import { cn } from "@/shared/lib";
import { Button } from "../button";
import { Input } from "../input";
import styles from "./image-field.module.scss";

export interface ImageFieldProps {
    label: string;
    hint?: string;
    /** Validation error of the address itself (from the form). */
    error?: string;
    /** Current address: an http(s) link or an uploaded /api/uploads/... path. */
    value: string;
    onChange: (value: string) => void;
    /** Sends the file and resolves with its address. */
    onUpload: (file: File) => Promise<{ url: string }>;
    /** Preview frame: round avatar or 2:3 poster. */
    shape: "avatar" | "poster";
    fieldClassName?: string;
}

/**
 * Image picker: paste a link or upload a file (JPEG, PNG or WebP, up to 5 MB), with a
 * preview and "Remove". Type and size are checked before anything is sent.
 */
export const ImageField = ({
    label,
    hint,
    error,
    value,
    onChange,
    onUpload,
    shape,
    fieldClassName,
}: ImageFieldProps) => {
    const { t } = useTranslation();
    const fileId = useId();
    const fileInput = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string>();
    const [broken, setBroken] = useState(false);

    const pick = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        // The same file can be chosen again after an error.
        event.target.value = "";
        if (!file) return;
        if (!(IMAGE_UPLOAD.types as readonly string[]).includes(file.type)) {
            setUploadError(t("imageField.wrongType"));
            return;
        }
        if (file.size > IMAGE_UPLOAD.maxBytes) {
            setUploadError(t("imageField.tooBig", { mb: IMAGE_UPLOAD.maxBytes / 1024 / 1024 }));
            return;
        }
        setUploadError(undefined);
        setUploading(true);
        try {
            const { url } = await onUpload(file);
            setBroken(false);
            onChange(url);
        } catch (failure) {
            setUploadError(
                isApiError(failure) && failure.fields?.file
                    ? t("imageField.rejected")
                    : getErrorMessage(failure),
            );
        } finally {
            setUploading(false);
        }
    };

    const preview = value.trim();
    return (
        <div className={cn(styles.field, fieldClassName)}>
            <div className={cn(styles.preview, styles[shape])}>
                {preview && !broken ? (
                    <img
                        src={preview}
                        alt={t("imageField.preview")}
                        className={styles.image}
                        onError={() => setBroken(true)}
                    />
                ) : (
                    <span className={styles.empty}>{t("imageField.none")}</span>
                )}
            </div>
            <div className={styles.controls}>
                <Input
                    label={label}
                    hint={hint}
                    error={error ?? uploadError}
                    inputMode="url"
                    value={value}
                    onChange={(event) => {
                        setBroken(false);
                        onChange(event.target.value);
                    }}
                    fieldClassName={styles.input}
                />
                <div className={styles.buttons}>
                    <input
                        ref={fileInput}
                        id={fileId}
                        type="file"
                        accept={IMAGE_UPLOAD.types.join(",")}
                        className={styles.fileInput}
                        onChange={(event) => void pick(event)}
                        aria-label={t("imageField.choose")}
                        tabIndex={-1}
                    />
                    <Button
                        type="button"
                        size="md"
                        variant="secondary"
                        disabled={uploading}
                        onClick={() => fileInput.current?.click()}
                    >
                        {uploading ? t("imageField.uploading") : t("imageField.upload")}
                    </Button>
                    {preview && (
                        <Button
                            type="button"
                            size="md"
                            variant="secondary"
                            disabled={uploading}
                            onClick={() => {
                                setUploadError(undefined);
                                onChange("");
                            }}
                        >
                            {t("imageField.remove")}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
