import { useTranslation } from "react-i18next";
import type { Activity } from "../api/activity-api";

/** What the action was, in words: "adds to the library (Planned)", "rates 9", … */
export const useActivityActionText = ({ type, payload }: Pick<Activity, "type" | "payload">) => {
    const { t } = useTranslation();
    const status = (value?: string) =>
        value ? t(`library.status.${value}` as "library.status.planned") : "";
    if (type === "rated") return t("activity.rated", { value: payload?.value });
    if (type === "library_added") return t("activity.added", { status: status(payload?.status) });
    if (payload?.to === "completed") return t("activity.completed");
    return t("activity.statusChanged", { from: status(payload?.from), to: status(payload?.to) });
};
