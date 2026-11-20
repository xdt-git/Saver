import { getErrorMessage, isApiError } from "@/shared/api";
import { i18n } from "@/shared/config/i18n";
import type { FieldErrors, ValidationKey } from "./validation";

export interface SubmitErrors<T> {
    fields: FieldErrors<T>;
    /** Message for the whole form (wrong credentials, too many attempts, no network). */
    form?: string;
}

const TAKEN: Record<string, ValidationKey> = { email: "emailTaken", username: "usernameTaken" };

/**
 * Turns an API error into form errors. Field messages from the server are in English,
 * so known cases get translated keys and the rest a generic "invalid" per field.
 */
export const toSubmitErrors = <T extends object>(
    error: unknown,
    knownFields: readonly (keyof T & string)[],
): SubmitErrors<T> => {
    if (!isApiError(error)) return { fields: {}, form: getErrorMessage(error) };

    const fields: FieldErrors<T> = {};
    for (const name of knownFields) {
        if (!error.fields?.[name]) continue;
        fields[name] = error.code === "CONFLICT" ? (TAKEN[name] ?? "invalid") : "invalid";
    }
    if (Object.keys(fields).length > 0) return { fields };

    if (error.code === "UNAUTHORIZED") {
        return { fields: {}, form: i18n.t("auth.login.invalidCredentials") };
    }
    // The only 400 of the auth forms: a used or expired email link.
    if (error.code === "BAD_REQUEST") {
        return { fields: {}, form: i18n.t("auth.linkInvalid") };
    }
    return { fields: {}, form: getErrorMessage(error) };
};
