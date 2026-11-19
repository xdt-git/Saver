import { i18n } from "@/shared/config/i18n";
import { isApiError } from "./api-error";

/**
 * User-facing text for any error, in the current language. API errors are translated by
 * their code (errors.<CODE>), so messages stay consistent and localized; anything else
 * falls back to the generic text.
 */
export const getErrorMessage = (error: unknown): string =>
    isApiError(error) ? i18n.t(`errors.${error.code}`) : i18n.t("errors.UNKNOWN");
