import { apiClient } from "./client";

export type ImageKind = "avatar" | "poster";

export interface UploadedImage {
    /** Path served by the API, e.g. /api/uploads/avatars/<id>.webp */
    url: string;
    width: number;
    height: number;
    bytes: number;
}

/** The same limits as the API (UPLOAD_MAX_MB, accepted formats), checked before sending. */
export const IMAGE_UPLOAD = {
    types: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: 5 * 1024 * 1024,
} as const;

/** Uploads one image; the API converts it to WebP at the size of its kind. */
export const uploadImage = (kind: ImageKind, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiClient.post<UploadedImage>(`/uploads/${kind}`, form);
};
