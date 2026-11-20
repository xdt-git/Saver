/** An image uploaded to our API (the same rule as the API's validator). */
const UPLOADED_IMAGE = /^\/api\/uploads\/(avatars|posters)\/[a-f0-9]{32}\.webp$/;

/** Whether a poster or avatar address is allowed: an http(s) link or our uploaded file. */
export const isImageSource = (value: string) =>
    UPLOADED_IMAGE.test(value) || /^https?:\/\/\S+$/i.test(value);
